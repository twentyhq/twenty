import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

import { Relation } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/relation.interface';

import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';

@Entity('applicationVariable')
@Unique('IDX_APPLICATION_VARIABLE_KEY_APPLICATION_ID_UNIQUE', [
  'key',
  'applicationId',
])
export class ApplicationVariableEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false, type: 'text' })
  key: string;

  @Column({ nullable: false, type: 'text', default: '' })
  value: string;

  @Column({ nullable: false, type: 'text', default: '' })
  description: string;

  @Column({ nullable: false, type: 'boolean', default: false })
  isSecret: boolean;

  @Column({ nullable: true, type: 'uuid' })
  applicationId?: string;

  @ManyToOne(
    () => ApplicationEntity,
    (application) => application.applicationVariables,
    {
      onDelete: 'CASCADE',
      nullable: true,
    },
  )
  @JoinColumn({ name: 'applicationId' })
  application: Relation<ApplicationEntity> | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
