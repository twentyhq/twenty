import { SKELETON_LOADER_HEIGHT_SIZES } from '@/activities/components/SkeletonLoader';
import { styled } from '@linaria/react';
import { useContext } from 'react';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';

const StyledSkeletonContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  height: 71px;
  padding-left: ${themeCssVariables.spacing[1]};
`;

const StyledSkeletonColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
`;

export const NavigationMenuItemSkeletonLoader = () => {
  const { theme } = useContext(ThemeContext);
  return (
    <SkeletonTheme
      baseColor={theme.background.tertiary}
      highlightColor={theme.background.transparent.lighter}
      borderRadius={4}
    >
      <StyledSkeletonContainer>
        <Skeleton
          width={56}
          height={SKELETON_LOADER_HEIGHT_SIZES.standard.xs}
        />
        <StyledSkeletonColumn>
          <Skeleton
            width={196}
            height={SKELETON_LOADER_HEIGHT_SIZES.standard.s}
          />
          <Skeleton
            width={196}
            height={SKELETON_LOADER_HEIGHT_SIZES.standard.s}
          />
        </StyledSkeletonColumn>
      </StyledSkeletonContainer>
    </SkeletonTheme>
  );
};
