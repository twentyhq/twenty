import { useCurrencyFieldDisplay } from '@/object-record/record-field/meta-types/hooks/useCurrencyFieldDisplay';
import { CurrencyDisplay } from '@/ui/field/display/components/CurrencyDisplay';
import styled from '@emotion/styled';

const StyledCurrencyDisplay = styled.div`
  align-items: center;
  display: flex;
  height: 20px;
`;
export const CurrencyFieldDisplay = () => {
  const { fieldValue } = useCurrencyFieldDisplay();

  return (
    <StyledCurrencyDisplay>
      <CurrencyDisplay currencyValue={fieldValue} />
    </StyledCurrencyDisplay>
  );
};
