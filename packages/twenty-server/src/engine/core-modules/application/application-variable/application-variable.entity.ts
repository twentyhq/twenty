import { ObjectType } from '@nestjs/graphql';

import { IDField } from '@ptc-org/nestjs-query-graphql';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { SyncableEntity } from 'src/engine/workspace-manager/types/syncable-entity.interface';

@Entity({
  name: 'applicationVariable',
  schema: 'core',
})
@ObjectType('ApplicationVariable')
export class ApplicationVariableEntity extends SyncableEntity {
  @IDField(() => UUIDScalarType)
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

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
