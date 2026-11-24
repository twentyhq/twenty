import { type ApplicationBillingPriceDTO } from 'src/engine/core-modules/application/dtos/application-billing-price.dto';

const PER_LABELS: Record<
  NonNullable<ApplicationBillingPriceDTO['per']>,
  string
> = {
  CONNECTED_ACCOUNT: ' per connected account',
  WORKSPACE_MEMBER: ' per member',
};

export const formatApplicationBillingPrice = ({
  amountCents,
  currency,
  per,
}: Pick<
  ApplicationBillingPriceDTO,
  'amountCents' | 'currency' | 'per'
>): string =>
  `${new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(
    amountCents / 100,
  )} / month${per === null ? '' : PER_LABELS[per]}`;
