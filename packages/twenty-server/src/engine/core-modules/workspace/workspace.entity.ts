import { Field, ID, ObjectType } from '@nestjs/graphql';

import { IDField, UnPagedRelation } from '@ptc-org/nestjs-query-graphql';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import Stripe from 'stripe';

import { User } from 'src/engine/core-modules/user/user.entity';
import { FeatureFlagEntity } from 'src/engine/core-modules/feature-flag/feature-flag.entity';
import { BillingSubscription } from 'src/engine/core-modules/billing/entities/billing-subscription.entity';
import { UserWorkspace } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { AppToken } from 'src/engine/core-modules/app-token/app-token.entity';

@Entity({ name: 'workspace', schema: 'core' })
@ObjectType('Workspace')
@UnPagedRelation('featureFlags', () => FeatureFlagEntity, { nullable: true })
@UnPagedRelation('billingSubscriptions', () => BillingSubscription, {
  nullable: true,
})
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
  @Column({ nullable: true, type: 'timestamptz' })
  deletedAt?: Date;

  @Field()
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @Field()
  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @OneToMany(() => AppToken, (appToken) => appToken.workspace, {
    cascade: true,
  })
  appTokens: AppToken[];

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

  @Field({ nullable: true })
  currentBillingSubscription: BillingSubscription;

  @Field()
  activationStatus: 'active' | 'inactive';

  @OneToMany(
    () => BillingSubscription,
    (billingSubscription) => billingSubscription.workspace,
  )
  billingSubscriptions: BillingSubscription[];
}
