import { SkeletonLine } from '@/ui/feedback/skeleton/components/SkeletonLine';
import { StyledAiChatContentContainer } from '@/ai/components/StyledAiChatContentContainer';
import { styled } from '@linaria/react';

import { themeCssVariables } from 'twenty-ui/theme';

const StyledSkeletonContainer = styled(StyledAiChatContentContainer)`
  display: flex;
  flex: 1;
  flex-direction: column;
  padding: ${themeCssVariables.spacing[3]};
`;

export const AiChatSkeletonLoader = () => {
  return (
    <StyledSkeletonContainer>
      <SkeletonLine height={20} borderRadius={8} />
    </StyledSkeletonContainer>
  );
};
