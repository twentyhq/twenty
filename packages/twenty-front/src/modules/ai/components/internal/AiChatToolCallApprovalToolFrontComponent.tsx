import { styled } from '@linaria/react';
import { type ReactNode, Suspense, lazy } from 'react';
import { themeCssVariables } from 'twenty-ui/theme';

import { FrontComponentSkeletonLoader } from '@/front-components/components/FrontComponentSkeletonLoader';

const FrontComponentRenderer = lazy(() =>
  import('@/front-components/components/FrontComponentRenderer').then(
    (module) => ({ default: module.FrontComponentRenderer }),
  ),
);

const StyledContainer = styled.div`
  background: ${themeCssVariables.background.secondary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.md};
  overflow: hidden;
`;

type AiChatToolCallApprovalToolFrontComponentProps = {
  frontComponentId: string;
  toolCallId: string;
  toolName: string;
  toolArguments: Record<string, unknown>;
  isAnswering: boolean;
  onToolArgumentsChange: (toolArguments: Record<string, unknown>) => void;
  unavailableFallback: ReactNode;
};

export const AiChatToolCallApprovalToolFrontComponent = ({
  frontComponentId,
  toolCallId,
  toolName,
  toolArguments,
  isAnswering,
  onToolArgumentsChange,
  unavailableFallback,
}: AiChatToolCallApprovalToolFrontComponentProps) => (
  <StyledContainer>
    <Suspense fallback={<FrontComponentSkeletonLoader />}>
      <FrontComponentRenderer
        frontComponentId={frontComponentId}
        toolCall={{
          toolCallId,
          toolName,
          status: isAnswering ? 'approval-responded' : 'approval-requested',
          input: toolArguments,
        }}
        onToolCallArgumentsChange={onToolArgumentsChange}
        loadingFallback={<FrontComponentSkeletonLoader />}
        unavailableFallback={unavailableFallback}
      />
    </Suspense>
  </StyledContainer>
);
