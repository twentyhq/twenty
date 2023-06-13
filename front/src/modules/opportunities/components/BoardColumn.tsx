import styled from '@emotion/styled';

// @TODO export in opportunities theme
export const StyledColumnTitle = styled.h3`
  font-family: 'Inter';
  font-style: normal;
  font-weight: ${({ theme }) => theme.fontWeightBold};
  font-size: ${({ theme }) => theme.fontSizeMedium};
  line-height: ${({ theme }) => theme.lineHeight};
  color: ${({ color }) => color};
  margin: 0;
  margin-bottom: ${({ theme }) => theme.spacing(2)};
`;
