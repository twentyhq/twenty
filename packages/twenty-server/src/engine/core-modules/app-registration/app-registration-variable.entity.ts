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
import { AppRegistrationEntity } from 'src/engine/core-modules/app-registration/app-registration.entity';

@Entity({ name: 'appRegistrationVariable', schema: 'core' })
@ObjectType('AppRegistrationVariable')
@Unique('IDX_APP_REGISTRATION_VARIABLE_KEY_APP_REGISTRATION_ID_UNIQUE', [
  'key',
  'appRegistrationId',
])
@Index('IDX_APP_REGISTRATION_VARIABLE_APP_REGISTRATION_ID', [
  'appRegistrationId',
])
export class AppRegistrationVariableEntity {
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
  appRegistrationId: string;

  @ManyToOne(
    () => AppRegistrationEntity,
    (appRegistration) => appRegistration.variables,
    { onDelete: 'CASCADE', nullable: false },
  )
  @JoinColumn({ name: 'appRegistrationId' })
  appRegistration: Relation<AppRegistrationEntity>;

  @Field()
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @Field()
  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
