import { AppErrorBoundary } from '@/error-handler/components/AppErrorBoundary';
import { AppErrorDisplay } from '@/error-handler/components/internal/AppErrorDisplay';
import { type AppErrorDisplayProps } from '@/error-handler/types/AppErrorDisplayProps';
import styled from '@emotion/styled';

const StyledWorkflowStepBody = styled.div`
  background: ${({ theme }) => theme.background.primary};
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  height: 100%;
  overflow-y: scroll;
  padding-block: ${({ theme }) => theme.spacing(4)};
  padding-inline: ${({ theme }) => theme.spacing(3)};
  row-gap: ${({ theme }) => theme.spacing(4)};
`;

export const WorkflowStepBody = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <StyledWorkflowStepBody className={className}>
      <AppErrorBoundary
        resetOnLocationChange={true}
        FallbackComponent={({
          error,
          resetErrorBoundary,
          title,
        }: AppErrorDisplayProps) => (
          <AppErrorDisplay
            error={error}
            resetErrorBoundary={resetErrorBoundary}
            title={title}
          />
        )}
      >
        {children}
      </AppErrorBoundary>
    </StyledWorkflowStepBody>
  );
};
