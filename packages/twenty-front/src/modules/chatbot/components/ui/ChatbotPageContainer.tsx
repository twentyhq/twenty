import styled from '@emotion/styled';
import { ReactNode } from 'react';

const StyledPageContainer = styled.div`
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: row;
  margin-top: ${({ theme }) => theme.spacing(1)};
`;

type ChatbotPageContainerProps = {
  children: ReactNode;
};

export const ChatbotPageContainer = ({
  children,
}: ChatbotPageContainerProps) => (
  <StyledPageContainer>{children}</StyledPageContainer>
);
