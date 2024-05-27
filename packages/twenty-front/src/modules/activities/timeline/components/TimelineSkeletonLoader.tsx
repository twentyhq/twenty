import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';

const StyledSkeletonContainer = styled.div`
  align-items: center;
  width: 100%;
  padding: ${({ theme }) => theme.spacing(8)};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(4)};
  flex-wrap: wrap;
  align-content: flex-start;
`;

const StyledSkeletonSubSection = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(4)};
`;

const StyledSkeletonColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(3)};
  justify-content: center;
`;

const StyledSkeletonLoader = ({
  isSecondColumn,
}: {
  isSecondColumn: boolean;
}) => {
  const theme = useTheme();
  return (
    <SkeletonTheme
      baseColor={theme.background.tertiary}
      highlightColor={theme.background.transparent.lighter}
      borderRadius={80}
    >
      <Skeleton width={24} height={isSecondColumn ? 120 : 84} />
    </SkeletonTheme>
  );
};

export const TimelineSkeletonLoader = () => {
  const theme = useTheme();
  const skeletonItems = Array.from({ length: 3 }).map((_, index) => ({
    id: `skeleton-item-${index}`,
  }));

  return (
    <SkeletonTheme
      baseColor={theme.background.tertiary}
      highlightColor={theme.background.transparent.lighter}
      borderRadius={4}
    >
      <StyledSkeletonContainer>
        <Skeleton width={440} height={16} />
        {skeletonItems.map(({ id }, index) => (
          <StyledSkeletonSubSection key={id}>
            <StyledSkeletonLoader isSecondColumn={index === 1} />
            <StyledSkeletonColumn>
              <Skeleton width={400} height={24} />
              <Skeleton width={400} height={24} />
              {index === 1 && <Skeleton width={400} height={24} />}
            </StyledSkeletonColumn>
          </StyledSkeletonSubSection>
        ))}
      </StyledSkeletonContainer>
    </SkeletonTheme>
  );
};
