import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  IncidentEntity, IncidentTimelineEntity, PostmortemEntity, EscalationPolicyEntity,
  IncidentStatus, IncidentSeverity, TimelineEntryType, EscalationLevel,
} from './incident-management.entity';

@Injectable()
export class IncidentManagementService {
  private readonly logger = new Logger(IncidentManagementService.name);

  constructor(
    @InjectRepository(IncidentEntity) private readonly incidentRepo: Repository<IncidentEntity>,
    @InjectRepository(IncidentTimelineEntity) private readonly timelineRepo: Repository<IncidentTimelineEntity>,
    @InjectRepository(PostmortemEntity) private readonly postmortemRepo: Repository<PostmortemEntity>,
    @InjectRepository(EscalationPolicyEntity) private readonly escalationRepo: Repository<EscalationPolicyEntity>,
  ) {}

  async createIncident(workspaceId: string, data: Partial<IncidentEntity>): Promise<IncidentEntity> {
    const incident = await this.incidentRepo.save(this.incidentRepo.create({
      workspaceId,
      detectedAt: new Date(),
      ...data,
    }));

    await this.addTimelineEntry(workspaceId, incident.id, {
      entryType: TimelineEntryType.STATUS_CHANGE,
      content: `Incident created: ${incident.title}`,
      newStatus: IncidentStatus.OPEN,
    });

    // Auto-escalate based on severity
    if (incident.severity === IncidentSeverity.SEV1 || incident.severity === IncidentSeverity.SEV2) {
      await this.escalate(workspaceId, incident.id, EscalationLevel.L2);
    }

    this.logger.warn(`Incident created [${incident.severity}]: ${incident.title}`);
    return incident;
  }

  async escalate(workspaceId: string, incidentId: string, level: EscalationLevel): Promise<IncidentEntity> {
    const incident = await this.findIncidentOrFail(incidentId);

    const policy = await this.escalationRepo.findOne({
      where: { workspaceId, service: incident.service, isActive: true },
    });

    await this.addTimelineEntry(workspaceId, incidentId, {
      entryType: TimelineEntryType.ESCALATION,
      content: `Incident escalated to ${level}${policy ? ` per policy "${policy.name}"` : ''}`,
    });

    if (policy && policy.levels) {
      const levelConfig = policy.levels.find((l) => l.level === level);
      if (levelConfig) {
        this.logger.log(`Notifying ${levelConfig.notifyUserIds.length} users via ${levelConfig.channels.join(', ')}`);
      }
    }

    return incident;
  }

  async addTimelineEntry(workspaceId: string, incidentId: string, data: Partial<IncidentTimelineEntity>): Promise<IncidentTimelineEntity> {
    return this.timelineRepo.save(this.timelineRepo.create({
      workspaceId, incidentId, ...data,
    }));
  }

  async createPostmortem(workspaceId: string, incidentId: string, data: Partial<PostmortemEntity>): Promise<PostmortemEntity> {
    const incident = await this.findIncidentOrFail(incidentId);

    return this.postmortemRepo.save(this.postmortemRepo.create({
      workspaceId, incidentId,
      title: data.title ?? `Postmortem: ${incident.title}`,
      ...data,
      status: 'draft',
    }));
  }

  async resolveIncident(workspaceId: string, incidentId: string, resolution: { rootCause: string; resolution: string }): Promise<IncidentEntity> {
    const incident = await this.findIncidentOrFail(incidentId);
    incident.status = IncidentStatus.RESOLVED;
    incident.resolvedAt = new Date();
    incident.rootCause = resolution.rootCause;
    incident.resolution = resolution.resolution;

    // Calculate time metrics
    if (incident.detectedAt) {
      if (incident.acknowledgedAt) {
        incident.timeToAcknowledgeMinutes = Math.round(
          (new Date(incident.acknowledgedAt).getTime() - new Date(incident.detectedAt).getTime()) / (1000 * 60),
        );
      }
      incident.timeToResolveMinutes = Math.round(
        (incident.resolvedAt.getTime() - new Date(incident.detectedAt).getTime()) / (1000 * 60),
      );
    }

    await this.addTimelineEntry(workspaceId, incidentId, {
      entryType: TimelineEntryType.STATUS_CHANGE,
      content: `Incident resolved: ${resolution.resolution}`,
      previousStatus: incident.status,
      newStatus: IncidentStatus.RESOLVED,
    });

    this.logger.log(`Incident ${incidentId} resolved. TTR: ${incident.timeToResolveMinutes} minutes`);
    return this.incidentRepo.save(incident);
  }

  async getActiveIncidents(workspaceId: string): Promise<IncidentEntity[]> {
    return this.incidentRepo.find({
      where: [
        { workspaceId, status: IncidentStatus.OPEN },
        { workspaceId, status: IncidentStatus.INVESTIGATING },
        { workspaceId, status: IncidentStatus.IDENTIFIED },
        { workspaceId, status: IncidentStatus.MITIGATING },
      ],
      order: { severity: 'ASC', createdAt: 'ASC' },
    });
  }

  async getMTTR(workspaceId: string): Promise<{
    overallMTTR: number; bySeverity: Record<string, number>;
    totalIncidents: number; resolvedIncidents: number; avgTimeToAcknowledge: number;
  }> {
    const incidents = await this.incidentRepo.find({ where: { workspaceId } });
    const resolved = incidents.filter((i) => i.status === IncidentStatus.RESOLVED || i.status === IncidentStatus.CLOSED);

    const withTTR = resolved.filter((i) => i.timeToResolveMinutes !== null && i.timeToResolveMinutes !== undefined);
    const withTTA = resolved.filter((i) => i.timeToAcknowledgeMinutes !== null && i.timeToAcknowledgeMinutes !== undefined);

    const bySeverity: Record<string, number> = {};
    for (const severity of Object.values(IncidentSeverity)) {
      const sevIncidents = withTTR.filter((i) => i.severity === severity);
      if (sevIncidents.length > 0) {
        bySeverity[severity] = Math.round(
          sevIncidents.reduce((s, i) => s + (i.timeToResolveMinutes ?? 0), 0) / sevIncidents.length,
        );
      }
    }

    return {
      overallMTTR: withTTR.length > 0
        ? Math.round(withTTR.reduce((s, i) => s + (i.timeToResolveMinutes ?? 0), 0) / withTTR.length)
        : 0,
      bySeverity,
      totalIncidents: incidents.length,
      resolvedIncidents: resolved.length,
      avgTimeToAcknowledge: withTTA.length > 0
        ? Math.round(withTTA.reduce((s, i) => s + (i.timeToAcknowledgeMinutes ?? 0), 0) / withTTA.length)
        : 0,
    };
  }

  private async findIncidentOrFail(incidentId: string): Promise<IncidentEntity> {
    const incident = await this.incidentRepo.findOne({ where: { id: incidentId } });
    if (!incident) throw new NotFoundException(`Incident ${incidentId} not found`);
    return incident;
  }
}
