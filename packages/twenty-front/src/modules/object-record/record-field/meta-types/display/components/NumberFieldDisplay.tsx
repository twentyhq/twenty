import { useNumberFieldDisplay } from '@/object-record/record-field/meta-types/hooks/useNumberFieldDisplay';
import { NumberDisplay } from '@/ui/field/display/components/NumberDisplay';
import styled from '@emotion/styled';
import { isDefined } from 'twenty-shared/utils';
import { formatNumber } from '~/utils/format/number';

export const NumberFieldDisplay = () => {
  const { fieldValue, fieldDefinition } = useNumberFieldDisplay();
  const decimals = fieldDefinition.metadata.settings?.decimals;
  const type = fieldDefinition.metadata.settings?.type;

  const StyledNumberDisplayContainer = styled.div`
    align-items: center;
    display: flex;
    height: 20px;
  `;

  if (!isDefined(fieldValue))
    return (
      <StyledNumberDisplayContainer>
        <NumberDisplay value={null} decimals={decimals} />
      </StyledNumberDisplayContainer>
    );
  const value =
    type === 'percentage'
      ? `${formatNumber(Number(fieldValue) * 100, decimals)}%`
      : formatNumber(Number(fieldValue), decimals);

  return (
    <StyledNumberDisplayContainer>
      <NumberDisplay value={value} decimals={decimals} />
    </StyledNumberDisplayContainer>
  );
};
