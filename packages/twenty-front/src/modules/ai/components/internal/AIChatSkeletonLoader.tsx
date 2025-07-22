import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';

const StyledSkeletonContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(6)};
  padding: ${({ theme }) => theme.spacing(3)};
`;

const StyledMessageBubble = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(3)};
`;

const StyledMessageSkeleton = styled.div`
  width: 100%;
`;

const NUMBER_OF_SKELETONS = 6;

export const AIChatSkeletonLoader = () => {
  const theme = useTheme();

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
