// traceable-link-logs/entities/traceable-link-log.entity.ts

import { Field, ObjectType } from '@nestjs/graphql';

import { IDField } from '@ptc-org/nestjs-query-graphql';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@Entity({ name: 'traceable_link_log', schema: 'core' })
@ObjectType('TraceableLinkLog')
export class TraceableLinkLog {
  @IDField(() => UUIDScalarType)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column({ nullable: false })
  linkId: string;

  @Field()
  @Column({ nullable: false })
  utmSource: string;

  @Field()
  @Column({ nullable: false })
  utmMedium: string;

  @Field()
  @Column({ nullable: false })
  utmCampaign: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  userIp?: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  userAgent?: string;

  @Field()
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @Field()
  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
