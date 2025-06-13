import styled from '@emotion/styled';
import { ReactNode } from 'react';
import { Button } from 'twenty-ui/input';

type ChatbotFlowEventContainerFormProps = {
  children: ReactNode;
  onClick?: () => void;
};

const StyledWrapper = styled.div`
  background-color: ${({ theme }) => theme.background.primary};
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const StyledContent = styled.div`
  flex: 1;
`;

const StyledFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  padding: ${({ theme }) => theme.spacing(4)};
  margin-right: ${({ theme }) => theme.spacing(2)};
`;

export const ChatbotFlowEventContainerForm = ({
  children,
  onClick,
}: ChatbotFlowEventContainerFormProps) => {
  return (
    <StyledWrapper>
      <StyledContent>{children}</StyledContent>
      <StyledFooter>
        <Button
          onClick={onClick}
          title="Delete"
          justify="center"
          accent="danger"
          variant="primary"
        />
      </StyledFooter>
    </StyledWrapper>
  );
};
