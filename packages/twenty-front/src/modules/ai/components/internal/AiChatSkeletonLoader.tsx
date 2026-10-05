import { StyledAiChatContentContainer } from '@/ai/components/StyledAiChatContentContainer';
import { styled } from '@linaria/react';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import { useTheme, themeCssVariables } from 'twenty-ui/theme';

const StyledSkeletonContainer = styled(StyledAiChatContentContainer)`
  display: flex;
  flex: 1;
  flex-direction: column;
  padding: ${themeCssVariables.spacing[3]};
`;

export const AiChatSkeletonLoader = () => {
  const theme = useTheme();

  return (
    <SkeletonTheme
      baseColor={theme.background.tertiary}
      highlightColor={theme.background.transparent.lighter}
      borderRadius={4}
    >
      <StyledSkeletonContainer>
        <Skeleton height={20} borderRadius={8} />
      </StyledSkeletonContainer>
    </SkeletonTheme>
  );
};
