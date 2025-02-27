import { css } from '@emotion/react';
import styled from '@emotion/styled';

const StyledList = styled.ul<{ depth: number }>`
  margin: 0;
  padding: 0;

  display: grid;
  row-gap: ${({ theme }) => theme.spacing(2)};

  ${({ depth }) =>
    depth > 0 &&
    css`
      padding-left: 32px;
    `}
`;

export { StyledList as JsonList };
