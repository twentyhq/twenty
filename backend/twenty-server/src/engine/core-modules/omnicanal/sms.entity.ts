import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

export enum SMSProvider {
  TWILIO = 'twilio',
  NEXMO = 'nexmo',
  PLIVO = 'plivo',
}

@Entity('sms_config')
@Index(['workspaceId'])
export class SMSConfigEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  workspaceId: string;

  @Column({ type: 'enum', enum: SMSProvider, default: SMSProvider.TWILIO })
  provider: SMSProvider;

  @Column({ type: 'text', nullable: true })
  apiKey: string;

  @Column({ type: 'text', nullable: true })
  apiSecret: string;

  @Column({ nullable: true })
  fromNumber: string;

  @Column({ type: 'boolean', default: true })
  enabled: boolean;

  @CreateDateColumn()
  createdAt: Date;
}

@Entity('sms_log')
@Index(['workspaceId', 'createdAt'])
export class SMSLogEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  workspaceId: string;

  @Column({ nullable: false })
  to: string;

  @Column({ type: 'text', nullable: false })
  body: string;

  @Column({ type: 'boolean', default: false })
  delivered: boolean;

  @CreateDateColumn()
  createdAt: Date;
}