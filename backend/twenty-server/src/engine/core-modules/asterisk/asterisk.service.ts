import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  AsteriskServerEntity, SIPExtensionEntity, CallLogEntity,
  CallQueueEntity, IVRMenuEntity, DialerCampaignEntity, SIPTrunkEntity,
  CallDirection, CallStatus, DialerMode,
} from './asterisk.entity';

// ARI REST client types
interface ARIChannel {
  id: string;
  state: string;
  caller: { number: string; name: string };
  connected: { number: string };
}

@Injectable()
export class AsteriskService {
  private readonly logger = new Logger(AsteriskService.name);

  constructor(
    @InjectRepository(AsteriskServerEntity) private readonly serverRepo: Repository<AsteriskServerEntity>,
    @InjectRepository(SIPExtensionEntity) private readonly extRepo: Repository<SIPExtensionEntity>,
    @InjectRepository(CallLogEntity) private readonly callRepo: Repository<CallLogEntity>,
    @InjectRepository(CallQueueEntity) private readonly queueRepo: Repository<CallQueueEntity>,
    @InjectRepository(IVRMenuEntity) private readonly ivrRepo: Repository<IVRMenuEntity>,
    @InjectRepository(DialerCampaignEntity) private readonly dialerRepo: Repository<DialerCampaignEntity>,
    @InjectRepository(SIPTrunkEntity) private readonly trunkRepo: Repository<SIPTrunkEntity>,
  ) {}

  // ==================== SERVER CONNECTION ====================

  async registerServer(workspaceId: string, data: Partial<AsteriskServerEntity>): Promise<AsteriskServerEntity> {
    return this.serverRepo.save(this.serverRepo.create({ workspaceId, ...data }));
  }

  async getActiveServer(workspaceId: string): Promise<AsteriskServerEntity> {
    const server = await this.serverRepo.findOne({ where: { workspaceId, isActive: true } });
    if (!server) throw new NotFoundException('No active Asterisk server configured');
    return server;
  }

  private async ariRequest(server: AsteriskServerEntity, method: string, path: string, body?: unknown): Promise<unknown> {
    const url = `${server.ariUrl}${path}`;
    const auth = Buffer.from(`${server.ariUser}:${server.ariPassword}`).toString('base64');

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Authorization': `Basic ${auth}`, 'Content-Type': 'application/json' },
        body: body ? JSON.stringify(body) : undefined,
      });

      if (!response.ok) {
        const errorBody = await response.text().catch(() => 'unknown');
        this.logger.error(`ARI ${method} ${path} failed: ${response.status} - ${errorBody}`);
        throw new Error(`ARI ${method} ${path} failed: ${response.status}`);
      }

      const contentType = response.headers.get('content-type') ?? '';
      if (contentType.includes('application/json')) {
        return response.json();
      }
      return {};
    } catch (error) {
      if (error instanceof Error && error.message.startsWith('ARI')) throw error;
      this.logger.error(`ARI connection failed for ${server.name}: ${error}`);
      await this.serverRepo.update(server.id, { connectionStatus: 'error' });
      throw new Error(`Cannot connect to Asterisk server ${server.name}`);
    }
  }

  // ==================== CLICK-TO-CALL ====================

  async clickToCall(
    workspaceId: string,
    userId: string,
    destination: string,
    options: { contactId?: string; dealId?: string; ticketId?: string; callerIdNumber?: string } = {},
  ): Promise<CallLogEntity> {
    const server = await this.getActiveServer(workspaceId);
    const ext = await this.extRepo.findOne({ where: { workspaceId, userId, isActive: true } });
    if (!ext) throw new NotFoundException(`No SIP extension for user ${userId}`);

    // ARI: originate call to extension, then bridge to destination
    const channelId = `call-${Date.now()}`;
    await this.ariRequest(server, 'POST', `/ari/channels`, {
      endpoint: `SIP/${ext.extension}`,
      extension: destination,
      context: 'from-internal',
      callerId: options.callerIdNumber ?? ext.callerIdNumber ?? ext.extension,
      channelId,
      variables: {
        DESTINATION: destination,
        CRM_CONTACT_ID: options.contactId ?? '',
        CRM_DEAL_ID: options.dealId ?? '',
      },
    });

    return this.callRepo.save(this.callRepo.create({
      workspaceId, uniqueId: channelId,
      direction: CallDirection.OUTBOUND, status: CallStatus.RINGING,
      callerNumber: ext.callerIdNumber ?? ext.extension, calledNumber: destination,
      extension: ext.extension, userId,
      contactId: options.contactId, dealId: options.dealId, ticketId: options.ticketId,
      startTime: new Date(),
    }));
  }

  // ==================== CALL EVENTS (AMI/ARI webhooks) ====================

  async handleCallEvent(workspaceId: string, event: {
    uniqueId: string;
    eventType: 'answer' | 'hangup' | 'dtmf' | 'recording_complete';
    data: Record<string, unknown>;
  }): Promise<CallLogEntity | null> {
    const call = await this.callRepo.findOne({ where: { workspaceId, uniqueId: event.uniqueId } });
    if (!call) return null;

    switch (event.eventType) {
      case 'answer':
        call.status = CallStatus.ANSWERED;
        call.answerTime = new Date();
        break;
      case 'hangup':
        call.endTime = new Date();
        call.durationSeconds = call.answerTime
          ? Math.floor((call.endTime.getTime() - call.answerTime.getTime()) / 1000)
          : 0;
        call.status = call.answerTime ? CallStatus.COMPLETED :
          (event.data['cause'] === '17' ? CallStatus.BUSY : CallStatus.NO_ANSWER);
        break;
      case 'dtmf':
        const dtmf = call.dtmfInput ?? [];
        dtmf.push(event.data['digit'] as string);
        call.dtmfInput = dtmf;
        break;
      case 'recording_complete':
        call.recordingUrl = event.data['recordingUrl'] as string;
        call.recordingFileId = event.data['fileId'] as string;
        break;
    }

    return this.callRepo.save(call);
  }

  // ==================== INBOUND CALL LOOKUP ====================

  async lookupInboundCaller(workspaceId: string, callerNumber: string): Promise<{
    contactId?: string;
    contactName?: string;
    activeDeals?: number;
    openTickets?: number;
    recentCalls?: CallLogEntity[];
  }> {
    const recentCalls = await this.callRepo.find({
      where: { workspaceId, callerNumber },
      order: { startTime: 'DESC' },
      take: 5,
    });

    const lastCallWithContact = recentCalls.find((c) => c.contactId);

    return {
      contactId: lastCallWithContact?.contactId ?? undefined,
      recentCalls,
    };
  }

  // ==================== RECORDING & TRANSCRIPTION ====================

  async startRecording(workspaceId: string, uniqueId: string): Promise<void> {
    const server = await this.getActiveServer(workspaceId);
    await this.ariRequest(server, 'POST', `/ari/channels/${uniqueId}/record`, {
      name: `recording-${uniqueId}`,
      format: 'wav',
      maxDurationSeconds: 3600,
      beep: false,
    });
  }

  async saveTranscription(callId: string, transcription: string, sentiment?: { score: number; label: string }): Promise<CallLogEntity> {
    const call = await this.callRepo.findOne({ where: { id: callId } });
    if (!call) throw new NotFoundException(`Call ${callId} not found`);
    call.transcription = transcription;
    if (sentiment) {
      call.sentimentScore = sentiment.score;
      call.sentimentLabel = sentiment.label;
    }
    return this.callRepo.save(call);
  }

  // ==================== SIP EXTENSIONS ====================

  async createExtension(workspaceId: string, data: Partial<SIPExtensionEntity>): Promise<SIPExtensionEntity> {
    return this.extRepo.save(this.extRepo.create({ workspaceId, ...data }));
  }

  async setPresence(extensionId: string, status: string): Promise<void> {
    await this.extRepo.update(extensionId, { presenceStatus: status });
  }

  async toggleDND(extensionId: string, enabled: boolean): Promise<void> {
    await this.extRepo.update(extensionId, { doNotDisturb: enabled });
  }

  // ==================== CALL QUEUES ====================

  async createQueue(workspaceId: string, data: Partial<CallQueueEntity>): Promise<CallQueueEntity> {
    return this.queueRepo.save(this.queueRepo.create({ workspaceId, ...data }));
  }

  async addQueueMember(queueId: string, extension: string): Promise<CallQueueEntity> {
    const queue = await this.queueRepo.findOne({ where: { id: queueId } });
    if (!queue) throw new NotFoundException(`Queue ${queueId} not found`);
    const members = queue.memberExtensions ?? [];
    if (!members.includes(extension)) members.push(extension);
    queue.memberExtensions = members;
    return this.queueRepo.save(queue);
  }

  async getQueueStats(workspaceId: string, queueName: string): Promise<{
    waiting: number;
    avgWait: number;
    answered: number;
    abandoned: number;
    sla: number;
  }> {
    const calls = await this.callRepo.find({
      where: { workspaceId, queueName },
      order: { startTime: 'DESC' },
      take: 100,
    });
    const answered = calls.filter((c) => c.status === CallStatus.COMPLETED);
    const abandoned = calls.filter((c) => c.status === CallStatus.NO_ANSWER && c.queueWaitSeconds);
    const avgWait = answered.length
      ? answered.reduce((s, c) => s + (c.queueWaitSeconds ?? 0), 0) / answered.length
      : 0;
    const slaTarget = 30;
    const withinSla = answered.filter((c) => (c.queueWaitSeconds ?? 0) <= slaTarget).length;

    return {
      waiting: 0,
      avgWait: Math.round(avgWait),
      answered: answered.length,
      abandoned: abandoned.length,
      sla: answered.length ? Math.round((withinSla / answered.length) * 100) : 100,
    };
  }

  // ==================== IVR ====================

  async createIVR(workspaceId: string, data: Partial<IVRMenuEntity>): Promise<IVRMenuEntity> {
    return this.ivrRepo.save(this.ivrRepo.create({ workspaceId, ...data }));
  }

  async processIVRInput(workspaceId: string, ivrId: string, digit: string): Promise<{ action: string; target: string } | null> {
    const ivr = await this.ivrRepo.findOne({ where: { id: ivrId } });
    if (!ivr) return null;
    const option = ivr.options?.find((o) => o.digit === digit);
    return option ? { action: option.action, target: option.target } : null;
  }

  // ==================== AUTO-DIALER ====================

  async createDialerCampaign(workspaceId: string, data: Partial<DialerCampaignEntity>): Promise<DialerCampaignEntity> {
    return this.dialerRepo.save(this.dialerRepo.create({ workspaceId, ...data }));
  }

  async startDialerCampaign(campaignId: string): Promise<DialerCampaignEntity> {
    const campaign = await this.dialerRepo.findOne({ where: { id: campaignId } });
    if (!campaign) throw new NotFoundException(`Campaign ${campaignId} not found`);
    campaign.status = 'running';
    return this.dialerRepo.save(campaign);
  }

  async pauseDialerCampaign(campaignId: string): Promise<DialerCampaignEntity> {
    await this.dialerRepo.update(campaignId, { status: 'paused' });
    const campaign = await this.dialerRepo.findOne({ where: { id: campaignId } });
    if (!campaign) throw new NotFoundException(`Campaign ${campaignId} not found`);
    return campaign;
  }

  async recordDialerResult(campaignId: string, result: 'connected' | 'noAnswer'): Promise<void> {
    const campaign = await this.dialerRepo.findOne({ where: { id: campaignId } });
    if (!campaign) return;
    campaign.contacted++;
    if (result === 'connected') campaign.connected++;
    else campaign.noAnswer++;
    campaign.connectRate = campaign.contacted ? (campaign.connected / campaign.contacted) * 100 : 0;
    await this.dialerRepo.save(campaign);
  }

  // ==================== SIP TRUNKS ====================

  async registerTrunk(workspaceId: string, data: Partial<SIPTrunkEntity>): Promise<SIPTrunkEntity> {
    return this.trunkRepo.save(this.trunkRepo.create({ workspaceId, ...data }));
  }

  // ==================== ANALYTICS ====================

  async getCallAnalytics(workspaceId: string, startDate: Date, endDate: Date): Promise<{
    totalCalls: number;
    inbound: number;
    outbound: number;
    answered: number;
    missed: number;
    avgDuration: number;
    avgWaitTime: number;
    topCallers: Array<{ userId: string; calls: number; talkTime: number }>;
  }> {
    const calls = await this.callRepo
      .createQueryBuilder('c')
      .where('c.workspaceId = :workspaceId', { workspaceId })
      .andWhere('c.startTime BETWEEN :start AND :end', { start: startDate, end: endDate })
      .getMany();

    const answered = calls.filter((c) => c.status === CallStatus.COMPLETED);
    const inbound = calls.filter((c) => c.direction === CallDirection.INBOUND);
    const outbound = calls.filter((c) => c.direction === CallDirection.OUTBOUND);
    const missed = calls.filter((c) => [CallStatus.NO_ANSWER, CallStatus.BUSY].includes(c.status));

    const byUser: Record<string, { calls: number; talkTime: number }> = {};
    for (const call of answered) {
      if (call.userId) {
        if (!byUser[call.userId]) byUser[call.userId] = { calls: 0, talkTime: 0 };
        byUser[call.userId].calls++;
        byUser[call.userId].talkTime += call.durationSeconds;
      }
    }

    return {
      totalCalls: calls.length,
      inbound: inbound.length,
      outbound: outbound.length,
      answered: answered.length,
      missed: missed.length,
      avgDuration: answered.length ? Math.round(answered.reduce((s, c) => s + c.durationSeconds, 0) / answered.length) : 0,
      avgWaitTime: Math.round(calls.filter((c) => c.queueWaitSeconds).reduce((s, c) => s + (c.queueWaitSeconds ?? 0), 0) / (calls.filter((c) => c.queueWaitSeconds).length || 1)),
      topCallers: Object.entries(byUser).map(([userId, data]) => ({ userId, ...data })).sort((a, b) => b.calls - a.calls).slice(0, 10),
    };
  }

  async getCallsByContact(workspaceId: string, contactId: string): Promise<CallLogEntity[]> {
    return this.callRepo.find({
      where: { workspaceId, contactId },
      order: { startTime: 'DESC' },
    });
  }

  async getCallsByDeal(workspaceId: string, dealId: string): Promise<CallLogEntity[]> {
    return this.callRepo.find({
      where: { workspaceId, dealId },
      order: { startTime: 'DESC' },
    });
  }

  async setDisposition(callId: string, code: string, notes?: string): Promise<CallLogEntity> {
    const call = await this.callRepo.findOne({ where: { id: callId } });
    if (!call) throw new NotFoundException(`Call ${callId} not found`);
    call.dispositionCode = code;
    if (notes) call.notes = notes;
    return this.callRepo.save(call);
  }
}
