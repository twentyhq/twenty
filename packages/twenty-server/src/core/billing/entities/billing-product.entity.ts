import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { BillingSubscription } from 'src/core/billing/entities/billing-subscription.entity';

@Entity({ name: 'billingProduct', schema: 'core' })
export class BillingProduct {
  @PrimaryGeneratedColumn('uuid')
  id: string;

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

  @Column({ nullable: false })
  stripeProductId: string;

  @Column({ nullable: false })
  stripePriceId: string;

  @Column({ nullable: false })
  quantity: number;
}
