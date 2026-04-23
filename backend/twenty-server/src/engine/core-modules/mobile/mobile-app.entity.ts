import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';

export enum MobileAppStatus {
  REGISTERED = 'registered',
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
}

export enum MobilePlatform {
  IOS = 'ios',
  ANDROID = 'android',
}

export enum PushNotificationProvider {
  APNS = 'apns',
  FCM = 'fcm',
}

@Entity('mobile_app')
export class MobileAppEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  workspaceId: string;

  @ManyToOne(() => WorkspaceEntity)
  @JoinColumn({ name: 'workspaceId' })
  workspace: WorkspaceEntity;

  @Column({ nullable: false })
  name: string;

  @Column({ nullable: false })
  bundleId: string;

  @Column({
    type: 'enum',
    enum: MobilePlatform,
    nullable: false,
  })
  platform: MobilePlatform;

  @Column({ type: 'text', nullable: true })
  pushNotificationToken: string;

  @Column({
    type: 'enum',
    enum: PushNotificationProvider,
    nullable: true,
  })
  pushProvider: PushNotificationProvider;

  @Column({
    type: 'enum',
    enum: MobileAppStatus,
    default: MobileAppStatus.REGISTERED,
  })
  status: MobileAppStatus;

  @Column({ type: 'varchar', nullable: true })
  version: string;

  @Column({ type: 'boolean', default: false })
  isProduction: boolean;

  @Column({ type: 'simple-json', nullable: true })
  config: {
    offlineEnabled?: boolean;
    maxOfflineRecords?: number;
    syncInterval?: number;
    biometricAuth?: boolean;
  };

  @Column({ type: 'timestamp', nullable: true })
  lastSyncAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

@Entity('mobile_device')
export class MobileDeviceEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  workspaceId: string;

  @ManyToOne(() => WorkspaceEntity)
  @JoinColumn({ name: 'workspaceId' })
  workspace: WorkspaceEntity;

  @Column({ nullable: false })
  userId: string;

  @Column({ nullable: false })
  deviceToken: string;

  @Column({ nullable: true })
  deviceId: string;

  @Column({ nullable: true })
  deviceName: string;

  @Column({
    type: 'enum',
    enum: MobilePlatform,
    nullable: false,
  })
  platform: MobilePlatform;

  @Column({ nullable: true })
  osVersion: string;

  @Column({ nullable: true })
  appVersion: string;

  @Column({ type: 'boolean', default: true })
  isOfflineEnabled: boolean;

  @Column({ type: 'timestamp', nullable: true })
  lastActiveAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
