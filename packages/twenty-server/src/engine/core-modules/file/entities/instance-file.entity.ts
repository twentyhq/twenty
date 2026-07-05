import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  type Relation,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

import { ADD_INSTANCE_FILE_TABLE_UPGRADE_COMMAND_NAME } from 'src/database/commands/upgrade-version-command/2-19/add-instance-file-table-upgrade-command-name.constant';
import { ApplicationRegistrationEntity } from 'src/engine/core-modules/application/application-registration/application-registration.entity';
import { WasIntroducedInUpgrade } from 'src/engine/core-modules/upgrade/decorators/was-introduced-in-upgrade.decorator';

@WasIntroducedInUpgrade({
  upgradeCommandName: ADD_INSTANCE_FILE_TABLE_UPGRADE_COMMAND_NAME,
})
@Entity('instanceFile')
@Unique('IDX_INSTANCE_FILE_PATH_UNIQUE', ['path'])
export class InstanceFileEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false, type: 'text' })
  path: string;

  @Column({ nullable: false, type: 'bigint' })
  size: number;

  @Column({
    nullable: false,
    type: 'varchar',
    default: 'application/octet-stream',
  })
  mimeType: string;

  @Column({ nullable: true, type: 'uuid' })
  applicationRegistrationId: string | null;

  @ManyToOne(() => ApplicationRegistrationEntity, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn({ name: 'applicationRegistrationId' })
  applicationRegistration: Relation<ApplicationRegistrationEntity> | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamptz' })
  deletedAt: Date | null;
}
