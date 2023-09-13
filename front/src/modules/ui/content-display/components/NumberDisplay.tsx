import styled from '@emotion/styled';

import { formatNumber } from '~/utils/format/number';

const StyledNumberDisplay = styled.div`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  width: 100%;
`;

type OwnProps = {
  value: string;
};

export function NumberDisplay({ value }: OwnProps) {
  return (
    <StyledNumberDisplay>
      {value && formatNumber(Number(value))}
    </StyledNumberDisplay>
  );
}
