import { SKELETON_LOADER_HEIGHT_SIZES } from '@/activities/components/SkeletonLoader';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import { randomInt } from '~/utils/number/randomInt';

const StyledMainContainer = styled.div`
  background: ${({ theme }) => theme.background.noisy};
  box-sizing: border-box;
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  gap: 8px;
  min-height: 0;
  padding-left: 0;
  height: 100%;
  padding: ${({ theme }) => theme.spacing(2)};
  width: 100%;
`;

const StyledSkeletonColumnContainer = styled.div`
  background: ${({ theme }) => theme.background.noisy};
  box-sizing: border-box;
  display: flex;
  flex: 1 1 auto;
  flex-direction: row;
  align-items: end;
  gap: 20px;
  min-height: 0;
  padding-left: 0;
  width: 100%;
`;

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

export const DashboardLinksPageBodyLoader = () => {
  const theme = useTheme();

  const skeletonItems = Array.from({ length: 15 }).map((_, index) => ({
    id: `skeleton-item-${index}`,
  }));

  return (
    <StyledMainContainer>
      <SkeletonTheme
        baseColor={theme.background.tertiary}
        highlightColor={theme.background.transparent.lighter}
        borderRadius={4}
      >
        <StyledSkeletonColumnContainer>
          {skeletonItems.map(({ id }) => (
            <SkeletonColumnLoader key={id} height={randomInt(200, 500)} />
          ))}
        </StyledSkeletonColumnContainer>
        <Skeleton
          width="100%"
          height={SKELETON_LOADER_HEIGHT_SIZES.standard.m}
        />
      </SkeletonTheme>
    </StyledMainContainer>
  );
};
