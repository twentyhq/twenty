import { Field, ObjectType } from '@nestjs/graphql';

import { TwoFactorAuthenticationStrategy } from 'twenty-shared/types';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Relation,
  UpdateDateColumn,
} from 'typeorm';

import { OTPStatus } from 'src/engine/core-modules/two-factor-authentication/strategies/otp/otp.constants';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';

@Index(['userWorkspaceId', 'strategy'], { unique: true })
@Entity({ name: 'twoFactorAuthenticationMethod', schema: 'core' })
@ObjectType('TwoFactorAuthenticationMethod')
export class TwoFactorAuthenticationMethodEntity {
  @Field()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field({ nullable: false })
  @Column({ nullable: false, type: 'uuid' })
  userWorkspaceId: string;

  @Field(() => UserWorkspaceEntity)
  @ManyToOne(
    () => UserWorkspaceEntity,
    (userWorkspace) => userWorkspace.twoFactorAuthenticationMethods,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'userWorkspaceId' })
  userWorkspace: Relation<UserWorkspaceEntity>;

  @Column({ nullable: false, type: 'text' })
  secret: string;

  @Column({
    type: 'enum',
    enum: OTPStatus,
    nullable: false,
  })
  status: OTPStatus;

  @Field(() => TwoFactorAuthenticationStrategy)
  @Column({
    type: 'enum',
    enum: TwoFactorAuthenticationStrategy,
  })
  strategy: TwoFactorAuthenticationStrategy;

  @Field()
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @Field()
  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @Field({ nullable: true })
  @Column({ nullable: true, type: 'timestamptz' })
  deletedAt: Date;
}
