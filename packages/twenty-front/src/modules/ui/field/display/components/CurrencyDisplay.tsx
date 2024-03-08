import { useContext } from 'react';
import styled from '@emotion/styled';

import { FieldContext } from '@/object-record/record-field/contexts/FieldContext';
import { CurrencyDisplayWithIcons } from '@/ui/field/display/components/CurrencyDisplayWithIcon';

import { EllipsisDisplay } from './EllipsisDisplay';

type CurrencyDisplayProps = {
  amount?: number | null;
};

const StyledEllipsisDisplay = styled(EllipsisDisplay)`
  align-items: center;
  display: flex;
`;

export const CurrencyDisplay = ({ amount }: CurrencyDisplayProps) => {
  const { showCurrencySymbol, currencyValues } = useContext(FieldContext);
  return (
    <StyledEllipsisDisplay>
      {showCurrencySymbol && (
        <CurrencyDisplayWithIcons currencyValues={currencyValues} />
      )}
      {amount}
    </StyledEllipsisDisplay>
  );
};
