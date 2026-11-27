import { styled } from '@linaria/react';
import { type ReactNode, Suspense, lazy } from 'react';
import {
  type FrontComponentToolCall,
  type ToolCallApprovalCard,
} from 'twenty-sdk/front-component';
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

type AiChatToolFrontComponentProps = {
  frontComponentId: string;
  toolCall: FrontComponentToolCall;
  onToolCallArgumentsChange?: (toolArguments: Record<string, unknown>) => void;
  onToolCallApprovalCardChange?: (labels: ToolCallApprovalCard) => void;
  onReady?: () => void;
  unavailableFallback: ReactNode;
  errorFallback?: ReactNode;
};

export const AiChatToolFrontComponent = ({
  frontComponentId,
  toolCall,
  onToolCallArgumentsChange,
  onToolCallApprovalCardChange,
  onReady,
  unavailableFallback,
  errorFallback,
}: AiChatToolFrontComponentProps) => (
  <StyledContainer>
    <Suspense fallback={<FrontComponentSkeletonLoader />}>
      <FrontComponentRenderer
        frontComponentId={frontComponentId}
        toolCall={toolCall}
        onToolCallArgumentsChange={onToolCallArgumentsChange}
        onToolCallApprovalCardChange={onToolCallApprovalCardChange}
        onReady={onReady}
        loadingFallback={<FrontComponentSkeletonLoader />}
        unavailableFallback={unavailableFallback}
        errorFallback={errorFallback}
      />
    </Suspense>
  </StyledContainer>
);
