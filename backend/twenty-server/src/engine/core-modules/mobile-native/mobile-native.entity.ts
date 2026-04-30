import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

export enum MobilePlatform { IOS = 'ios', ANDROID = 'android', WEB = 'web' }
export enum BiometricType { FINGERPRINT = 'fingerprint', FACE_ID = 'face_id', IRIS = 'iris', PIN = 'pin' }
export enum OfflineActionType { CREATE = 'create', UPDATE = 'update', DELETE = 'delete', SYNC = 'sync' }
export enum SyncStatus { PENDING = 'pending', SYNCING = 'syncing', SYNCED = 'synced', FAILED = 'failed', CONFLICT = 'conflict' }
export enum CheckinType { CLIENT_VISIT = 'client_visit', MEETING = 'meeting', EVENT = 'event', FIELD_WORK = 'field_work' }

@Entity('mobile_session')
@Index(['workspaceId', 'userId'])
export class MobileSessionEntity {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ nullable: false }) workspaceId: string;
  @Column({ nullable: false }) userId: string;
  @Column({ type: 'enum', enum: MobilePlatform, default: MobilePlatform.ANDROID }) platform: MobilePlatform;
  @Column({ type: 'varchar', length: 50, nullable: true }) appVersion: string;
  @Column({ type: 'varchar', length: 50, nullable: true }) osVersion: string;
  @Column({ type: 'varchar', length: 100, nullable: true }) deviceModel: string;
  @Column({ type: 'varchar', length: 255, nullable: true }) deviceId: string;
  @Column({ type: 'varchar', length: 255, nullable: true }) pushToken: string;
  @Column({ type: 'boolean', default: false }) biometricEnabled: boolean;
  @Column({ type: 'boolean', default: false }) offlineModeEnabled: boolean;
  @Column({ type: 'boolean', default: true }) isActive: boolean;
  @Column({ type: 'timestamp', nullable: true }) lastActiveAt: Date;
  @Column({ type: 'float', nullable: true }) lastLat: number;
  @Column({ type: 'float', nullable: true }) lastLng: number;
  @Column({ type: 'int', default: 0 }) sessionCount: number;
  @Column({ type: 'int', default: 0 }) offlineSyncsPending: number;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}

@Entity('biometric_config')
@Index(['workspaceId', 'userId'])
export class BiometricConfigEntity {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ nullable: false }) workspaceId: string;
  @Column({ nullable: false }) userId: string;
  @Column({ type: 'enum', enum: BiometricType, default: BiometricType.FINGERPRINT }) biometricType: BiometricType;
  @Column({ type: 'boolean', default: true }) isEnabled: boolean;
  @Column({ type: 'text', nullable: true }) publicKeyHash: string;
  @Column({ type: 'varchar', length: 255, nullable: true }) deviceId: string;
  @Column({ type: 'int', default: 0 }) failedAttempts: number;
  @Column({ type: 'int', default: 5 }) maxFailedAttempts: number;
  @Column({ type: 'boolean', default: false }) isLocked: boolean;
  @Column({ type: 'timestamp', nullable: true }) lockedUntil: Date;
  @Column({ type: 'timestamp', nullable: true }) lastAuthAt: Date;
  @Column({ type: 'boolean', default: true }) requireForPayments: boolean;
  @Column({ type: 'boolean', default: false }) requireForDataExport: boolean;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}

@Entity('offline_queue')
@Index(['workspaceId', 'userId'])
@Index(['workspaceId', 'syncStatus'])
export class OfflineQueueEntity {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ nullable: false }) workspaceId: string;
  @Column({ nullable: false }) userId: string;
  @Column({ type: 'enum', enum: OfflineActionType, default: OfflineActionType.CREATE }) actionType: OfflineActionType;
  @Column({ type: 'varchar', length: 100, nullable: false }) entityName: string;
  @Column({ nullable: true }) entityId: string;
  @Column({ type: 'simple-json', nullable: true }) payload: Record<string, string | number | boolean>;
  @Column({ type: 'enum', enum: SyncStatus, default: SyncStatus.PENDING }) syncStatus: SyncStatus;
  @Column({ type: 'int', default: 0 }) retryCount: number;
  @Column({ type: 'int', default: 3 }) maxRetries: number;
  @Column({ type: 'text', nullable: true }) errorMessage: string;
  @Column({ type: 'text', nullable: true }) conflictData: string;
  @Column({ type: 'timestamp', nullable: false }) queuedAt: Date;
  @Column({ type: 'timestamp', nullable: true }) syncedAt: Date;
  @Column({ type: 'int', default: 0 }) priority: number;
  @CreateDateColumn() createdAt: Date;
}

@Entity('location_checkin')
@Index(['workspaceId', 'userId'])
export class LocationCheckinEntity {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ nullable: false }) workspaceId: string;
  @Column({ nullable: false }) userId: string;
  @Column({ type: 'enum', enum: CheckinType, default: CheckinType.CLIENT_VISIT }) checkinType: CheckinType;
  @Column({ type: 'float', nullable: false }) latitude: number;
  @Column({ type: 'float', nullable: false }) longitude: number;
  @Column({ type: 'float', nullable: true }) accuracy: number;
  @Column({ type: 'varchar', length: 500, nullable: true }) address: string;
  @Column({ nullable: true }) accountId: string;
  @Column({ nullable: true }) contactId: string;
  @Column({ type: 'text', nullable: true }) notes: string;
  @Column({ type: 'simple-array', nullable: true }) photoIds: string[];
  @Column({ type: 'int', nullable: true }) durationMinutes: number;
  @Column({ type: 'timestamp', nullable: true }) checkinAt: Date;
  @Column({ type: 'timestamp', nullable: true }) checkoutAt: Date;
  @Column({ type: 'float', nullable: true }) distanceFromAccountKm: number;
  @CreateDateColumn() createdAt: Date;
}
