import styled from '@emotion/styled';

import { formatNumber } from '~/utils/format/number';

const StyledTextInputDisplay = styled.div`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  width: 100%;
`;

type OwnProps = {
  value: number | null;
};

export function MoneyDisplay({ value }: OwnProps) {
  return (
    <StyledTextInputDisplay>
      {value ? `$${formatNumber(value)}` : ''}
    </StyledTextInputDisplay>
  );
}
