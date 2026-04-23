import { Field, ObjectType } from '@nestjs/graphql';

import { IDField } from '@ptc-org/nestjs-query-graphql';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

export enum ConfigVariableVersionAction {
  SET = 'SET',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
}

@Entity({ name: 'configVariableVersion', schema: 'core' })
@ObjectType('ConfigVariableVersionRecord')
@Index('IDX_CONFIG_VARIABLE_VERSION_KEY_CREATED_AT', ['key', 'createdAt'])
export class ConfigVariableVersionEntity {
  @IDField(() => UUIDScalarType)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => String)
  @Column({ nullable: false, type: 'text' })
  key: string;

  @Field(() => String)
  @Column({
    type: 'enum',
    enum: Object.values(ConfigVariableVersionAction),
    nullable: false,
  })
  action: ConfigVariableVersionAction;

  @Field(() => JSON, { nullable: true })
  @Column('jsonb', { nullable: true })
  previousValue: JSON | null;

  @Field(() => JSON, { nullable: true })
  @Column('jsonb', { nullable: true })
  nextValue: JSON | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
