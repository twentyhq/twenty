import { Field, ObjectType } from '@nestjs/graphql';

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

import { UserWorkspace } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { TwoFactorAuthenticationStrategy } from 'twenty-shared/types';
import { OTPContext } from '../two-factor-authentication.interface';

@Index(['userWorkspaceId', 'strategy'], { unique: true })
@Entity({ name: 'twoFactorMethod', schema: 'core' })
@ObjectType()
export class TwoFactorAuthenticationMethod {
  @Field()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field({ nullable: false })
  @Column({ nullable: false, type: 'uuid' })
  userWorkspaceId: string;

  @Field(() => UserWorkspace)
  @ManyToOne(
    () => UserWorkspace,
    (userWorkspace) => userWorkspace.twoFactorMethods,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'userWorkspaceId' })
  userWorkspace: Relation<UserWorkspace>;

  @Column({ nullable: true, type: 'jsonb' })
  context: OTPContext | null;

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
