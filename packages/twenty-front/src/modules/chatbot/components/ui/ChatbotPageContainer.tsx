import styled from '@emotion/styled';
import { ReactNode } from 'react';

const StyledPageContainer = styled.div`
  display: flex;
  flex-direction: row;
  height: 100%;
  margin-top: ${({ theme }) => theme.spacing(1)};
  width: 100%;
`;

type ChatbotPageContainerProps = {
  children: ReactNode;
};

export const ChatbotPageContainer = ({
  children,
}: ChatbotPageContainerProps) => (
  <StyledPageContainer>{children}</StyledPageContainer>
);
