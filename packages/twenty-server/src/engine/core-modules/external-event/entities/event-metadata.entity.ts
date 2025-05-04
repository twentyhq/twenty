import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Relation,
  UpdateDateColumn,
} from 'typeorm';

import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';

import { EventFieldMetadata } from './event-field-metadata.entity';

@Entity('eventMetadata')
export class EventMetadata {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  name: string;

  @Column({ nullable: true, type: 'text' })
  description: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  strictValidation: boolean;

  @Column('simple-array', { nullable: true })
  validObjectTypes: string[];

  @Column({ type: 'uuid', nullable: false })
  workspaceId: string;

  @ManyToOne(() => Workspace, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'workspaceId' })
  workspace: Workspace;

  @OneToMany(() => EventFieldMetadata, (field) => field.eventMetadata, {
    cascade: true,
    eager: true,
  })
  fields: Relation<EventFieldMetadata[]>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
