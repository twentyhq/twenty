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
import { TwoFactorAuthenticationStrategy } from 'twenty-shared/types';

import { UserWorkspace } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { OTPContext } from 'src/engine/core-modules/two-factor-authentication/two-factor-authentication.interface';

@Index(['userWorkspaceId', 'strategy'], { unique: true })
@Entity({ name: 'twoFactorAuthenticationMethod', schema: 'core' })
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
    (userWorkspace) => userWorkspace.twoFactorAuthenticationMethod,
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
