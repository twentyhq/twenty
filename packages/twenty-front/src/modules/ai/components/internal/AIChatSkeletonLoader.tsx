import { styled } from '@linaria/react';
import { useContext } from 'react';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import { ThemeContext } from 'twenty-ui/theme';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledSkeletonContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[6]};
  padding: ${themeCssVariables.spacing[3]};
`;

const StyledMessageBubble = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[3]};
`;

const StyledMessageSkeleton = styled.div`
  width: 100%;
`;

const NUMBER_OF_SKELETONS = 6;

export const AIChatSkeletonLoader = () => {
  const { theme } = useContext(ThemeContext);

  return (
    <SkeletonTheme
      baseColor={theme.background.tertiary}
      highlightColor={theme.background.transparent.lighter}
      borderRadius={4}
    >
      <StyledSkeletonContainer>
        {Array.from({ length: NUMBER_OF_SKELETONS }).map((_, index) => (
          <StyledMessageBubble key={index}>
            <Skeleton width={24} height={24} borderRadius={4} />

            <StyledMessageSkeleton>
              <Skeleton height={20} borderRadius={8} />
            </StyledMessageSkeleton>
          </StyledMessageBubble>
        ))}
      </StyledSkeletonContainer>
    </SkeletonTheme>
  );
};
