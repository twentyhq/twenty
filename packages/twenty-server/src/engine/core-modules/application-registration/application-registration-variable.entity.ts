import { Field, ObjectType } from '@nestjs/graphql';

import { IDField } from '@ptc-org/nestjs-query-graphql';
import {
  Column,
  CreateDateColumn,
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
import { ApplicationRegistrationEntity } from 'src/engine/core-modules/application-registration/application-registration.entity';

@Entity({ name: 'applicationRegistrationVariable', schema: 'core' })
@ObjectType('ApplicationRegistrationVariable')
@Unique('IDX_APP_REG_VAR_KEY_APP_REGISTRATION_ID_UNIQUE', [
  'key',
  'applicationRegistrationId',
])
@Index('IDX_APP_REG_VAR_APP_REGISTRATION_ID', ['applicationRegistrationId'])
export class ApplicationRegistrationVariableEntity {
  @IDField(() => UUIDScalarType)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column({ nullable: false, type: 'text' })
  key: string;

  @Column({ nullable: false, type: 'text', default: '' })
  encryptedValue: string;

  @Field()
  @Column({ nullable: false, type: 'text', default: '' })
  description: string;

  @Field()
  @Column({ nullable: false, type: 'boolean', default: true })
  isSecret: boolean;

  @Field()
  @Column({ nullable: false, type: 'boolean', default: false })
  isRequired: boolean;

  @Field()
  get isFilled(): boolean {
    return this.encryptedValue !== '';
  }

  @Column({ nullable: false, type: 'uuid' })
  applicationRegistrationId: string;

  @ManyToOne(
    () => ApplicationRegistrationEntity,
    (applicationRegistration) => applicationRegistration.variables,
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
}
