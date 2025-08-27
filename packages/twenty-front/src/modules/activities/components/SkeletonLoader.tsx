import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';

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

const StyledSkeletonSubSectionContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(3)};
  justify-content: center;
`;

export const SKELETON_LOADER_HEIGHT_SIZES = {
  standard: {
    xs: 13,
    s: 16,
    m: 24,
    l: 32,
    xl: 40,
  },
  columns: {
    s: 84,
    m: 120,
    xxl: 542,
  },
};

const SkeletonColumnLoader = ({ height }: { height: number }) => {
  const theme = useTheme();

  return (
    <SkeletonTheme
      baseColor={theme.background.tertiary}
      highlightColor={theme.background.transparent.lighter}
      borderRadius={80}
    >
      <Skeleton width={24} height={height} />
    </SkeletonTheme>
  );
};

export const SkeletonLoader = ({
  withSubSections = false,
}: {
  withSubSections?: boolean;
}) => {
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
        <Skeleton
          width={440}
          height={SKELETON_LOADER_HEIGHT_SIZES.standard.s}
        />
        {withSubSections &&
          skeletonItems.map(({ id }, index) => (
            <StyledSkeletonSubSection key={id}>
              <SkeletonColumnLoader
                height={
                  index === 1
                    ? SKELETON_LOADER_HEIGHT_SIZES.columns.m
                    : SKELETON_LOADER_HEIGHT_SIZES.columns.s
                }
              />
              <StyledSkeletonSubSectionContent>
                <Skeleton
                  width={400}
                  height={SKELETON_LOADER_HEIGHT_SIZES.standard.m}
                />
                <Skeleton
                  width={400}
                  height={SKELETON_LOADER_HEIGHT_SIZES.standard.m}
                />
                {index === 1 && (
                  <Skeleton
                    width={400}
                    height={SKELETON_LOADER_HEIGHT_SIZES.standard.m}
                  />
                )}
              </StyledSkeletonSubSectionContent>
            </StyledSkeletonSubSection>
          ))}
      </StyledSkeletonContainer>
    </SkeletonTheme>
  );
};
