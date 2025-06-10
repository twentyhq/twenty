import { ObjectType, registerEnumType } from '@nestjs/graphql';

import { IDField } from '@ptc-org/nestjs-query-graphql';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Relation,
  UpdateDateColumn,
} from 'typeorm';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { BillingSubscription } from 'src/engine/core-modules/billing/entities/billing-subscription.entity';
import { ChargeStatus } from 'src/engine/core-modules/billing/enums/billing-charge.status.enum';
import { ChargeMetadata } from 'src/engine/core-modules/inter/types/chargeMetadata.type';

registerEnumType(ChargeStatus, {
  name: 'ChargeStatus',
  description: 'The status of the bank slip charge',
});

@Entity({ name: 'billingCharge', schema: 'core' })
@ObjectType()
export class BillingCharge {
  @IDField(() => UUIDScalarType)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true, unique: true })
  chargeCode: string;

  @Column({ nullable: true })
  interBillingChargeFilePath: string;

  @Column({
    type: 'enum',
    enum: ChargeStatus,
    nullable: false,
    default: ChargeStatus.UNPAID,
  })
  status: ChargeStatus;

  @Column({ type: 'timestamptz' })
  dueDate: Date;

  @Column({ type: 'jsonb', default: {}, nullable: false })
  metadata: ChargeMetadata;

  @ManyToOne(
    () => BillingSubscription,
    (subscription) => subscription.billingSubscriptionCharges,
    {
      nullable: true,
      cascade: ['insert', 'update'],
    },
  )
  @JoinColumn()
  billingSubscription: Relation<BillingSubscription>;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
