import { styled } from '@linaria/react';
import { type ReactNode, Suspense, lazy } from 'react';
import { type FrontComponentToolCall } from 'twenty-sdk/front-component';
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

const StyledLoaderContainer = styled.div`
  height: ${themeCssVariables.spacing[20]};
`;

type AiChatToolFrontComponentProps = {
  frontComponentId: string;
  toolCall: FrontComponentToolCall;
  onToolCallArgumentsChange?: (toolArguments: Record<string, unknown>) => void;
  unavailableFallback: ReactNode;
  errorFallback?: ReactNode;
};

export const AiChatToolFrontComponent = ({
  frontComponentId,
  toolCall,
  onToolCallArgumentsChange,
  unavailableFallback,
  errorFallback,
}: AiChatToolFrontComponentProps) => {
  const loadingFallback = (
    <StyledLoaderContainer>
      <FrontComponentSkeletonLoader />
    </StyledLoaderContainer>
  );

  return (
    <StyledContainer>
      <Suspense fallback={loadingFallback}>
        <FrontComponentRenderer
          frontComponentId={frontComponentId}
          toolCall={toolCall}
          onToolCallArgumentsChange={onToolCallArgumentsChange}
          loadingFallback={loadingFallback}
          unavailableFallback={unavailableFallback}
          errorFallback={errorFallback}
        />
      </Suspense>
    </StyledContainer>
  );
};
