import { styled } from '@linaria/react';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import {
  themeCssVariables,
  resolveThemeVariable,
} from 'twenty-ui/theme-constants';

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
  return (
    <SkeletonTheme
      baseColor={resolveThemeVariable(themeCssVariables.background.tertiary)}
      highlightColor={resolveThemeVariable(
        themeCssVariables.background.transparent.lighter,
      )}
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
