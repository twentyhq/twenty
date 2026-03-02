import { SKELETON_LOADER_HEIGHT_SIZES } from '@/activities/components/SkeletonLoader';
import { NavigationDrawerSection } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerSection';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';

const StyledTitleSkeleton = styled.div`
  padding-left: ${({ theme }) => theme.spacing(1)};
  padding-right: ${({ theme }) => theme.spacing(0.5)};
  height: ${({ theme }) => theme.spacing(5)};
  display: flex;
  align-items: center;
`;

const StyledRowsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1)};
  padding-left: ${({ theme }) => theme.spacing(1)};
`;

export const NavigationDrawerWorkspaceSectionSkeletonLoader = () => {
  const theme = useTheme();
  return (
    <NavigationDrawerSection>
      <SkeletonTheme
        baseColor={theme.background.tertiary}
        highlightColor={theme.background.transparent.light}
        borderRadius={4}
      >
        <StyledTitleSkeleton>
          <Skeleton
            width={72}
            height={SKELETON_LOADER_HEIGHT_SIZES.standard.xs}
          />
        </StyledTitleSkeleton>
        <StyledRowsContainer>
          <Skeleton
            width={196}
            height={SKELETON_LOADER_HEIGHT_SIZES.standard.s}
          />
          <Skeleton
            width={196}
            height={SKELETON_LOADER_HEIGHT_SIZES.standard.s}
          />
          <Skeleton
            width={196}
            height={SKELETON_LOADER_HEIGHT_SIZES.standard.s}
          />
        </StyledRowsContainer>
      </SkeletonTheme>
    </NavigationDrawerSection>
  );
};
