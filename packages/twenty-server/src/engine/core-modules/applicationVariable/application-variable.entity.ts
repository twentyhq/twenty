import { ObjectType } from '@nestjs/graphql';

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
import { IDField } from '@ptc-org/nestjs-query-graphql';

import { Relation } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/relation.interface';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';

@Entity({
  name: 'applicationVariable',
  schema: 'core',
})
@ObjectType()
@Unique('IDX_APPLICATION_VARIABLE_KEY_APPLICATION_ID_UNIQUE', [
  'key',
  'applicationId',
])
export class ApplicationVariable {
  @IDField(() => UUIDScalarType)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false, type: 'text' })
  key: string;

  @Column({ nullable: false, type: 'text', default: '' })
  value: string;

  @Column({ nullable: true, type: 'text' })
  description?: string;

  @Column({ nullable: true, type: 'text' })
  defaultValue?: string;

  @Column({ nullable: false, type: 'boolean', default: false })
  isSecret: boolean;

  @Column({ nullable: false, type: 'uuid' })
  applicationId: string;

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
