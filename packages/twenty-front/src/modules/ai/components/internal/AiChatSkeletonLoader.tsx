import { StyledAiChatContentContainer } from '@/ai/components/StyledAiChatContentContainer';
import { styled } from '@linaria/react';
import { Skeleton } from 'twenty-ui/primitives/feedback';
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
      <Skeleton
        layout="line"
        baseColor={themeCssVariables.background.tertiary}
        highlightColor={themeCssVariables.background.transparent.lighter}
        height={20}
        borderRadius={8}
      />
    </StyledSkeletonContainer>
  );
};
