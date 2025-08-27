import styled from '@emotion/styled';

export const StyledFormCardTitle = styled.h3`
  color: ${({ theme }) => theme.font.color.extraLight};
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  margin: 0;
  margin-bottom: ${({ theme }) => theme.spacing(4)};
`;
