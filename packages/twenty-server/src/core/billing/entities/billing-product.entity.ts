import { Field, ID, ObjectType } from '@nestjs/graphql';

import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { IDField } from '@ptc-org/nestjs-query-graphql';

import { BillingSubscription } from 'src/core/billing/entities/billing-subscription.entity';

@Entity({ name: 'billingProduct', schema: 'core' })
@ObjectType('BillingProduct')
export class BillingProduct {
  @IDField(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column({ nullable: false })
  billingSubscriptionId: string;

  @ManyToOne(
    () => BillingSubscription,
    (billingSubscription) => billingSubscription.billingProducts,
    {
      onDelete: 'CASCADE',
    },
  )
  billingSubscription: BillingSubscription;

  @Field()
  @Column({ nullable: false })
  stripeProductId: string;

  @Field()
  @Column({ nullable: false })
  stripePriceId: string;

  @Field()
  @Column({ nullable: false })
  quantity: number;
}
