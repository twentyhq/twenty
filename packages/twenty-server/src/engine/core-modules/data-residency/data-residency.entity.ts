import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum DataRegion {
  US_EAST = 'us-east',
  US_WEST = 'us-west',
  EU_WEST = 'eu-west',
  EU_CENTRAL = 'eu-central',
  ASIA_PACIFIC = 'asia-pacific',
  LATAM = 'latam',
  COLOMBIA = 'colombia',
  CANADA = 'canada',
}

export enum DataResidencyStatus {
  ACTIVE = 'active',
  PENDING = 'pending',
  MIGRATING = 'migrating',
  FAILED = 'failed',
}

@Entity('data_residency')
export class DataResidencyEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, nullable: false })
  workspaceId: string;

  @Column({
    type: 'enum',
    enum: DataRegion,
    default: DataRegion.US_EAST,
  })
  currentRegion: DataRegion;

  @Column({
    type: 'enum',
    enum: DataRegion,
    nullable: true,
  })
  requestedRegion: DataRegion;

  @Column({
    type: 'enum',
    enum: DataResidencyStatus,
    default: DataResidencyStatus.ACTIVE,
  })
  status: DataResidencyStatus;

  @Column({ type: 'timestamp', nullable: true })
  migrationStartedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  migrationCompletedAt: Date;

  @Column({ type: 'text', nullable: true })
  migrationError: string;

  @Column({ type: 'boolean', default: false })
  enforceRegion: boolean;

  @Column({ type: 'simple-array', nullable: true })
  allowedRegions: DataRegion[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
