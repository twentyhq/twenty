import { styled } from '@linaria/react';

const StyledSubTitle = styled.div`
  color: ${({ theme }) => theme.font.color.secondary};
  text-align: center;
`;

export { StyledSubTitle as SubTitle };
