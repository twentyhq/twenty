import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

export enum CallDirection {
  INBOUND = 'inbound',
  OUTBOUND = 'outbound',
  INTERNAL = 'internal',
}

export enum CallStatus {
  RINGING = 'ringing',
  ANSWERED = 'answered',
  BUSY = 'busy',
  NO_ANSWER = 'no_answer',
  FAILED = 'failed',
  COMPLETED = 'completed',
  VOICEMAIL = 'voicemail',
}

export enum DialerMode {
  PREVIEW = 'preview',
  POWER = 'power',
  PREDICTIVE = 'predictive',
}

export enum TrunkStatus {
  REGISTERED = 'registered',
  UNREACHABLE = 'unreachable',
  LAGGED = 'lagged',
}

// --- ASTERISK SERVER CONNECTION ---
@Entity('asterisk_server')
@Index(['workspaceId'])
export class AsteriskServerEntity {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ nullable: false }) workspaceId: string;
  @Column({ nullable: false }) name: string;
  @Column({ nullable: false }) ariUrl: string;
  @Column({ nullable: false }) ariUser: string;
  @Column({ nullable: false }) ariPassword: string;
  @Column({ type: 'varchar', length: 255, nullable: true }) amiHost: string;
  @Column({ type: 'int', default: 5038 }) amiPort: number;
  @Column({ type: 'varchar', length: 100, nullable: true }) amiUser: string;
  @Column({ type: 'varchar', length: 100, nullable: true }) amiPassword: string;
  @Column({ type: 'boolean', default: true }) isActive: boolean;
  @Column({ type: 'varchar', length: 20, default: 'disconnected' }) connectionStatus: string;
  @Column({ type: 'timestamp', nullable: true }) lastHeartbeat: Date;
  @CreateDateColumn() createdAt: Date;
}

// --- SIP EXTENSIONS ---
@Entity('sip_extension')
@Index(['workspaceId', 'extension'], { unique: true })
export class SIPExtensionEntity {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ nullable: false }) workspaceId: string;
  @Column({ nullable: false }) userId: string;
  @Column({ type: 'varchar', length: 20, nullable: false }) extension: string;
  @Column({ type: 'varchar', length: 255, nullable: true }) callerIdName: string;
  @Column({ type: 'varchar', length: 50, nullable: true }) callerIdNumber: string;
  @Column({ type: 'varchar', length: 20, default: 'available' }) presenceStatus: string;
  @Column({ type: 'boolean', default: false }) doNotDisturb: boolean;
  @Column({ type: 'varchar', length: 20, nullable: true }) forwardTo: string;
  @Column({ type: 'varchar', length: 255, nullable: true }) voicemailEmail: string;
  @Column({ type: 'boolean', default: true }) isActive: boolean;
  @CreateDateColumn() createdAt: Date;
}

// --- CALL LOG ---
@Entity('call_log')
@Index(['workspaceId', 'startTime'])
@Index(['workspaceId', 'contactId'])
@Index(['workspaceId', 'dealId'])
export class CallLogEntity {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ nullable: false }) workspaceId: string;
  @Column({ type: 'varchar', length: 100, nullable: false }) uniqueId: string;
  @Column({ type: 'enum', enum: CallDirection }) direction: CallDirection;
  @Column({ type: 'enum', enum: CallStatus, default: CallStatus.RINGING }) status: CallStatus;
  @Column({ type: 'varchar', length: 50, nullable: false }) callerNumber: string;
  @Column({ type: 'varchar', length: 50, nullable: false }) calledNumber: string;
  @Column({ type: 'varchar', length: 20, nullable: true }) extension: string;
  @Column({ nullable: true }) userId: string;
  @Column({ nullable: true }) contactId: string;
  @Column({ nullable: true }) dealId: string;
  @Column({ nullable: true }) ticketId: string;
  @Column({ type: 'timestamp', nullable: false }) startTime: Date;
  @Column({ type: 'timestamp', nullable: true }) answerTime: Date;
  @Column({ type: 'timestamp', nullable: true }) endTime: Date;
  @Column({ type: 'int', default: 0 }) durationSeconds: number;
  @Column({ type: 'int', default: 0 }) holdTimeSeconds: number;
  @Column({ type: 'varchar', length: 500, nullable: true }) recordingUrl: string;
  @Column({ type: 'varchar', length: 255, nullable: true }) recordingFileId: string;
  @Column({ type: 'text', nullable: true }) transcription: string;
  @Column({ type: 'float', nullable: true }) sentimentScore: number;
  @Column({ type: 'varchar', length: 20, nullable: true }) sentimentLabel: string;
  @Column({ type: 'simple-json', nullable: true }) dtmfInput: string[];
  @Column({ type: 'text', nullable: true }) notes: string;
  @Column({ type: 'varchar', length: 50, nullable: true }) dispositionCode: string;
  @Column({ type: 'varchar', length: 50, nullable: true }) queueName: string;
  @Column({ type: 'int', nullable: true }) queueWaitSeconds: number;
  @CreateDateColumn() createdAt: Date;
}

// --- CALL QUEUES ---
@Entity('call_queue')
@Index(['workspaceId'])
export class CallQueueEntity {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ nullable: false }) workspaceId: string;
  @Column({ nullable: false }) name: string;
  @Column({ type: 'varchar', length: 50, default: 'ringall' }) strategy: string;
  @Column({ type: 'int', default: 30 }) timeout: number;
  @Column({ type: 'int', default: 120 }) maxWait: number;
  @Column({ type: 'int', default: 0 }) maxCallers: number;
  @Column({ type: 'simple-array', nullable: true }) memberExtensions: string[];
  @Column({ type: 'varchar', length: 255, nullable: true }) musicOnHold: string;
  @Column({ type: 'varchar', length: 255, nullable: true }) announceMessage: string;
  @Column({ type: 'int', default: 0 }) announceFrequency: number;
  @Column({ type: 'boolean', default: true }) isActive: boolean;
  @CreateDateColumn() createdAt: Date;
}

// --- IVR MENUS ---
@Entity('ivr_menu')
@Index(['workspaceId'])
export class IVRMenuEntity {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ nullable: false }) workspaceId: string;
  @Column({ nullable: false }) name: string;
  @Column({ type: 'varchar', length: 255, nullable: true }) greetingAudioUrl: string;
  @Column({ type: 'text', nullable: true }) greetingTTS: string;
  @Column({ type: 'simple-json', nullable: true }) options: Array<{
    digit: string;
    action: 'queue' | 'extension' | 'ivr' | 'voicemail' | 'external' | 'ai_agent';
    target: string;
    label: string;
  }>;
  @Column({ type: 'varchar', length: 50, nullable: true }) timeoutAction: string;
  @Column({ type: 'varchar', length: 50, nullable: true }) invalidAction: string;
  @Column({ type: 'int', default: 3 }) maxRetries: number;
  @Column({ type: 'boolean', default: true }) isActive: boolean;
  @CreateDateColumn() createdAt: Date;
}

// --- AUTO-DIALER CAMPAIGNS ---
@Entity('dialer_campaign')
@Index(['workspaceId', 'status'])
export class DialerCampaignEntity {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ nullable: false }) workspaceId: string;
  @Column({ nullable: false }) name: string;
  @Column({ type: 'enum', enum: DialerMode, default: DialerMode.POWER }) mode: DialerMode;
  @Column({ type: 'varchar', length: 20, default: 'draft' }) status: string;
  @Column({ type: 'varchar', length: 50, nullable: true }) callerIdNumber: string;
  @Column({ type: 'simple-array', nullable: true }) contactListIds: string[];
  @Column({ type: 'simple-array', nullable: true }) agentExtensions: string[];
  @Column({ type: 'int', default: 1 }) linesPerAgent: number;
  @Column({ type: 'float', default: 1.5 }) predictiveRatio: number;
  @Column({ type: 'int', default: 30 }) maxRingTime: number;
  @Column({ type: 'int', default: 3 }) maxAttempts: number;
  @Column({ type: 'int', default: 60 }) retryIntervalMinutes: number;
  @Column({ type: 'simple-json', nullable: true }) schedule: { startHour: number; endHour: number; timezone: string; workDays: number[] };
  @Column({ type: 'int', default: 0 }) totalContacts: number;
  @Column({ type: 'int', default: 0 }) contacted: number;
  @Column({ type: 'int', default: 0 }) connected: number;
  @Column({ type: 'int', default: 0 }) noAnswer: number;
  @Column({ type: 'float', default: 0 }) connectRate: number;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}

// --- SIP TRUNKS ---
@Entity('sip_trunk')
@Index(['workspaceId'])
export class SIPTrunkEntity {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ nullable: false }) workspaceId: string;
  @Column({ nullable: false }) name: string;
  @Column({ type: 'varchar', length: 50, default: 'twilio' }) provider: string;
  @Column({ type: 'varchar', length: 255, nullable: false }) host: string;
  @Column({ type: 'int', default: 5060 }) port: number;
  @Column({ type: 'varchar', length: 100, nullable: true }) username: string;
  @Column({ type: 'varchar', length: 100, nullable: true }) password: string;
  @Column({ type: 'int', default: 0 }) maxChannels: number;
  @Column({ type: 'varchar', length: 20, default: 'unreachable' }) status: string;
  @Column({ type: 'simple-array', nullable: true }) dids: string[];
  @Column({ type: 'boolean', default: true }) isActive: boolean;
  @CreateDateColumn() createdAt: Date;
}
