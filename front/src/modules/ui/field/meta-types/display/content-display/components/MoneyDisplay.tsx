import styled from '@emotion/styled';

import { formatNumber } from '~/utils/format/number';

const StyledTextInputDisplay = styled.div`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  width: 100%;
`;

type MoneyDisplayProps = {
  value: number | null;
};

export const MoneyDisplay = ({ value }: MoneyDisplayProps) => (
  <StyledTextInputDisplay>
    {value ? `$${formatNumber(value)}` : ''}
  </StyledTextInputDisplay>
);
