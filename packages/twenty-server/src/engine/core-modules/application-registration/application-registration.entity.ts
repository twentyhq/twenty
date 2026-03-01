import { Field, ObjectType } from '@nestjs/graphql';

import { IDField } from '@ptc-org/nestjs-query-graphql';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  type Relation,
  UpdateDateColumn,
} from 'typeorm';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { ApplicationRegistrationVariableEntity } from 'src/engine/core-modules/application-registration/application-registration-variable.entity';
import { UserEntity } from 'src/engine/core-modules/user/user.entity';

@Entity({ name: 'applicationRegistration', schema: 'core' })
@ObjectType('ApplicationRegistration')
@Index(
  'IDX_APPLICATION_REGISTRATION_UNIVERSAL_IDENTIFIER_UNIQUE',
  ['universalIdentifier'],
  {
    unique: true,
    where: '"deletedAt" IS NULL',
  },
)
@Index(
  'IDX_APPLICATION_REGISTRATION_OAUTH_CLIENT_ID_UNIQUE',
  ['oAuthClientId'],
  {
    unique: true,
    where: '"deletedAt" IS NULL',
  },
)
@Index('IDX_APPLICATION_REGISTRATION_CREATED_BY_USER_ID', ['createdByUserId'])
export class ApplicationRegistrationEntity {
  @IDField(() => UUIDScalarType)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column({ nullable: false, type: 'uuid' })
  universalIdentifier: string;

  @Field()
  @Column({ nullable: false, type: 'text' })
  name: string;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true, type: 'text' })
  description: string | null;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true, type: 'text' })
  logoUrl: string | null;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true, type: 'text' })
  author: string | null;

  @Field()
  @Column({ nullable: false, type: 'text' })
  oAuthClientId: string;

  @Column({ nullable: true, type: 'text' })
  oAuthClientSecretHash: string | null;

  @Field(() => [String])
  @Column({ type: 'text', array: true, default: '{}' })
  oAuthRedirectUris: string[];

  @Field(() => [String])
  @Column({ type: 'text', array: true, default: '{}' })
  oAuthScopes: string[];

  @Column({ nullable: true, type: 'uuid' })
  createdByUserId: string | null;

  @ManyToOne(() => UserEntity, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'createdByUserId' })
  createdByUser: Relation<UserEntity> | null;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true, type: 'text' })
  websiteUrl: string | null;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true, type: 'text' })
  termsUrl: string | null;

  @OneToMany(
    () => ApplicationRegistrationVariableEntity,
    (variable) => variable.applicationRegistration,
    { onDelete: 'CASCADE' },
  )
  variables: Relation<ApplicationRegistrationVariableEntity[]>;

  @Field()
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @Field()
  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamptz' })
  deletedAt: Date | null;
}
