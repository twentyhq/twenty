import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

export enum EventFormat { IN_PERSON = 'in_person', VIRTUAL = 'virtual', HYBRID = 'hybrid' }
export enum RegistrationStatus { REGISTERED = 'registered', CONFIRMED = 'confirmed', ATTENDED = 'attended', NO_SHOW = 'no_show', CANCELLED = 'cancelled', WAITLIST = 'waitlist' }

@Entity('crm_event')
@Index(['workspaceId', 'startDate'])
export class CRMEventEntity {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ nullable: false }) workspaceId: string;
  @Column({ nullable: false }) name: string;
  @Column({ type: 'text', nullable: true }) description: string;
  @Column({ type: 'enum', enum: EventFormat, default: EventFormat.VIRTUAL }) format: EventFormat;
  @Column({ type: 'timestamp', nullable: false }) startDate: Date;
  @Column({ type: 'timestamp', nullable: false }) endDate: Date;
  @Column({ type: 'varchar', length: 500, nullable: true }) location: string;
  @Column({ type: 'varchar', length: 500, nullable: true }) streamingUrl: string;
  @Column({ type: 'int', default: 0 }) capacity: number;
  @Column({ type: 'int', default: 0 }) registrationCount: number;
  @Column({ type: 'int', default: 0 }) attendeeCount: number;
  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 }) budget: number;
  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 }) actualCost: number;
  @Column({ type: 'int', default: 0 }) leadsGenerated: number;
  @Column({ type: 'int', default: 0 }) dealsCreated: number;
  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 }) revenueAttributed: number;
  @Column({ type: 'simple-json', nullable: true }) sessions: Array<{ name: string; startTime: string; endTime: string; track: string; speakerId?: string; room?: string }>;
  @Column({ type: 'simple-json', nullable: true }) sponsors: Array<{ name: string; tier: string; benefits: string[] }>;
  @Column({ type: 'varchar', length: 50, nullable: true }) templateId: string;
  @Column({ type: 'boolean', default: false }) isRecurring: boolean;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}

@Entity('event_registration')
@Index(['eventId', 'contactId'])
export class EventRegistrationEntity {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ nullable: false }) eventId: string;
  @Column({ nullable: false }) contactId: string;
  @Column({ type: 'enum', enum: RegistrationStatus, default: RegistrationStatus.REGISTERED }) status: RegistrationStatus;
  @Column({ type: 'varchar', length: 100, nullable: true }) qrCode: string;
  @Column({ type: 'timestamp', nullable: true }) checkedInAt: Date;
  @Column({ type: 'simple-array', nullable: true }) sessionsAttended: string[];
  @Column({ type: 'int', default: 0 }) scoreEarned: number;
  @CreateDateColumn() createdAt: Date;
}
