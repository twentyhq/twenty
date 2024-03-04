import { Field, ID, ObjectType } from '@nestjs/graphql';

import { IDField, UnPagedRelation } from '@ptc-org/nestjs-query-graphql';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import Stripe from 'stripe';

import { User } from 'src/core/user/user.entity';
import { FeatureFlagEntity } from 'src/core/feature-flag/feature-flag.entity';
import { BillingSubscription } from 'src/core/billing/entities/billing-subscription.entity';
import { UserWorkspace } from 'src/core/user-workspace/user-workspace.entity';

@Entity({ name: 'workspace', schema: 'core' })
@ObjectType('Workspace')
@UnPagedRelation('featureFlags', () => FeatureFlagEntity, { nullable: true })
export class Workspace {
  @IDField(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  domainName?: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  displayName?: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  logo?: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  inviteHash?: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  deletedAt?: Date;

  @Field()
  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @Field()
  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt: Date;

  @OneToMany(() => User, (user) => user.defaultWorkspace)
  users: User[];

  @OneToMany(() => UserWorkspace, (userWorkspace) => userWorkspace.workspace, {
    onDelete: 'CASCADE',
  })
  workspaceUsers: UserWorkspace[];

  @Field()
  @Column({ default: true })
  allowImpersonation: boolean;

  @OneToMany(() => FeatureFlagEntity, (featureFlag) => featureFlag.workspace)
  featureFlags: FeatureFlagEntity[];

  @Field()
  @Column({ default: 'incomplete' })
  subscriptionStatus: Stripe.Subscription.Status;

  @Field()
  activationStatus: 'active' | 'inactive';

  @OneToOne(
    () => BillingSubscription,
    (billingSubscription) => billingSubscription.workspace,
  )
  billingSubscription: BillingSubscription;
}
