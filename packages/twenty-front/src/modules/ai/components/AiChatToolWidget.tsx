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

type AiChatToolWidgetProps = {
  toolCall: FrontComponentToolCall;
  frontComponentId: string;
  unavailableFallback: ReactNode;
};

export const AiChatToolWidget = ({
  toolCall,
  frontComponentId,
  unavailableFallback,
}: AiChatToolWidgetProps) => (
  <StyledContainer>
    <Suspense fallback={<FrontComponentSkeletonLoader />}>
      <FrontComponentRenderer
        frontComponentId={frontComponentId}
        toolCall={toolCall}
        loadingFallback={<FrontComponentSkeletonLoader />}
        unavailableFallback={unavailableFallback}
      />
    </Suspense>
  </StyledContainer>
);
