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
import { AppRegistrationVariableEntity } from 'src/engine/core-modules/app-registration/app-registration-variable.entity';
import { UserEntity } from 'src/engine/core-modules/user/user.entity';

@Entity({ name: 'appRegistration', schema: 'core' })
@ObjectType('AppRegistration')
@Index('IDX_APP_REGISTRATION_UNIVERSAL_IDENTIFIER_UNIQUE', ['universalIdentifier'], {
  unique: true,
  where: '"deletedAt" IS NULL',
})
@Index('IDX_APP_REGISTRATION_CLIENT_ID_UNIQUE', ['clientId'], {
  unique: true,
  where: '"deletedAt" IS NULL',
})
@Index('IDX_APP_REGISTRATION_CREATED_BY_USER_ID', ['createdByUserId'])
export class AppRegistrationEntity {
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
  clientId: string;

  @Column({ nullable: true, type: 'text' })
  clientSecretHash: string | null;

  @Field(() => [String])
  @Column({ type: 'text', array: true, default: '{}' })
  redirectUris: string[];

  @Field(() => [String])
  @Column({ type: 'text', array: true, default: '{}' })
  scopes: string[];

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
    () => AppRegistrationVariableEntity,
    (variable) => variable.appRegistration,
    { onDelete: 'CASCADE' },
  )
  variables: Relation<AppRegistrationVariableEntity[]>;

  @Field()
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @Field()
  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamptz' })
  deletedAt: Date | null;
}
