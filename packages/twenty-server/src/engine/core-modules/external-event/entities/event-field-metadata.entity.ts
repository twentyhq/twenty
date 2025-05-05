import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Relation,
  UpdateDateColumn,
} from 'typeorm';

import { EventMetadata } from './event-metadata.entity';

export enum FieldType {
  STRING = 'string',
  NUMBER = 'number',
  BOOLEAN = 'boolean',
  OBJECT = 'object',
}

@Entity('eventFieldMetadata')
export class EventFieldMetadata {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  name: string;

  @Column({ nullable: true, type: 'text' })
  description: string;

  @Column({
    type: 'enum',
    enum: FieldType,
    default: FieldType.STRING,
  })
  fieldType: FieldType;

  @Column({ type: 'boolean', default: false })
  isRequired: boolean;

  @Column({ default: true })
  isActive: boolean;

  @Column('simple-json', { nullable: true })
  allowedValues: any[];

  @Column({ type: 'uuid', nullable: false })
  eventMetadataId: string;

  @ManyToOne(() => EventMetadata, (metadata) => metadata.fields, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'eventMetadataId' })
  eventMetadata: Relation<EventMetadata>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
