import { FieldMoneyAmountV2Value } from '@/ui/object/field/types/FieldMetadata';

import { EllipsisDisplay } from './EllipsisDisplay';

type MoneyAmountV2DisplayProps = {
  value?: FieldMoneyAmountV2Value;
};

export const MoneyAmountV2Display = ({ value }: MoneyAmountV2DisplayProps) => {
  return (
    <EllipsisDisplay>
      {value?.amount} {value?.currency}
    </EllipsisDisplay>
  );
};
