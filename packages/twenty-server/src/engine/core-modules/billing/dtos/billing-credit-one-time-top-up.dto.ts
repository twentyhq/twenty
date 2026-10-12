/* @license Enterprise */

import { Field, ObjectType } from '@nestjs/graphql';

import { BillingUpdateDTO } from 'src/engine/core-modules/billing/dtos/billing-update.dto';
import { BillingCreditOneTimeTopUpStatus } from 'src/engine/core-modules/billing/enums/billing-credit-one-time-top-up-status.enum';

@ObjectType('BillingCreditOneTimeTopUp')
export class BillingCreditOneTimeTopUpDTO extends BillingUpdateDTO {
  @Field(() => BillingCreditOneTimeTopUpStatus)
  status: BillingCreditOneTimeTopUpStatus;

  @Field(() => String, {
    description:
      'Stripe page where the customer completes a payment that needs their action',
    nullable: true,
  })
  hostedInvoiceUrl: string | null;
}
