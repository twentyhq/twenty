import styled from '@emotion/styled';

export const StyledDimmable = styled.div<{ $dimmed: boolean }>`
  opacity: ${({ $dimmed }) => ($dimmed ? 0.72 : 1)};
`;
