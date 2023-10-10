import styled from '@emotion/styled';

import { formatNumber } from '~/utils/format/number';

const StyledNumberDisplay = styled.div`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  width: 100%;
`;

type NumberDisplayProps = {
  value: string | number | null;
};

export const NumberDisplay = ({ value }: NumberDisplayProps) => (
  <StyledNumberDisplay>
    {value && formatNumber(Number(value))}
  </StyledNumberDisplay>
);
