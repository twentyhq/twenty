import { Field, ObjectType } from '@nestjs/graphql';

import { IDField } from '@ptc-org/nestjs-query-graphql';
import {
  type ServerCronTriggerSettings,
  type ServerWebhookTriggerSettings,
} from 'twenty-shared/application';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  type Relation,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { ApplicationRegistrationEntity } from 'src/engine/core-modules/application/application-registration/application-registration.entity';

@Entity({ name: 'applicationRegistrationLogicFunction', schema: 'core' })
@ObjectType('ApplicationRegistrationLogicFunction')
@Unique('IDX_APP_REG_LOGIC_FN_UID_APP_REGISTRATION_ID_UNIQUE', [
  'universalIdentifier',
  'applicationRegistrationId',
])
@Index('IDX_APP_REG_LOGIC_FN_APP_REGISTRATION_ID', [
  'applicationRegistrationId',
])
export class ApplicationRegistrationLogicFunctionEntity {
  @IDField(() => UUIDScalarType)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column({ nullable: false, type: 'uuid' })
  universalIdentifier: string;

  @Field()
  @Column({ nullable: false, type: 'text' })
  name: string;

  @Column({ nullable: true, type: 'jsonb' })
  serverWebhookTriggerSettings: ServerWebhookTriggerSettings | null;

  @Column({ nullable: true, type: 'jsonb' })
  serverCronTriggerSettings: ServerCronTriggerSettings | null;

  @Field(() => Date, { nullable: true })
  @Column({ nullable: true, type: 'timestamptz' })
  disabledAt: Date | null;

  @Column({ nullable: false, type: 'uuid' })
  applicationRegistrationId: string;

  @ManyToOne(
    () => ApplicationRegistrationEntity,
    (applicationRegistration) => applicationRegistration.logicFunctions,
    { onDelete: 'CASCADE', nullable: false },
  )
  @JoinColumn({ name: 'applicationRegistrationId' })
  applicationRegistration: Relation<ApplicationRegistrationEntity>;

  @Field()
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @Field()
  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamptz' })
  deletedAt: Date | null;
}
