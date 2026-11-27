import { SkeletonLine } from '@/ui/feedback/skeleton/components/SkeletonLine';
import { NavigationDrawerSection } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerSection';
import { styled } from '@linaria/react';
import { SKELETON_HEIGHT_SIZES } from 'twenty-ui/primitives/feedback';
import { themeCssVariables } from 'twenty-ui/theme';

const SKELETON_ROW_LABEL_WIDTHS = [72, 48, 88];

const StyledTitleSkeleton = styled.div`
  align-items: center;
  display: flex;
  height: ${themeCssVariables.spacing[7]};
  padding-left: ${themeCssVariables.spacing[1]};
`;

const StyledRowsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing['0.5']};
`;

const StyledRowSkeleton = styled.div`
  align-items: center;
  border: 1px solid transparent;
  box-sizing: border-box;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  height: ${themeCssVariables.spacing[7]};
  padding-left: ${themeCssVariables.spacing[1]};
`;

export const NavigationDrawerWorkspaceSectionSkeletonLoader = () => {
  return (
    <NavigationDrawerSection>
      <StyledTitleSkeleton>
        <SkeletonLine
          width={64}
          height={SKELETON_HEIGHT_SIZES.xs}
          highlightColor={themeCssVariables.background.transparent.light}
        />
      </StyledTitleSkeleton>
      <StyledRowsContainer>
        {SKELETON_ROW_LABEL_WIDTHS.map((labelWidth) => (
          <StyledRowSkeleton key={labelWidth}>
            <SkeletonLine
              width={SKELETON_HEIGHT_SIZES.s}
              height={SKELETON_HEIGHT_SIZES.s}
              highlightColor={themeCssVariables.background.transparent.light}
            />
            <SkeletonLine
              width={labelWidth}
              height={SKELETON_HEIGHT_SIZES.xs}
              highlightColor={themeCssVariables.background.transparent.light}
            />
          </StyledRowSkeleton>
        ))}
      </StyledRowsContainer>
    </NavigationDrawerSection>
  );
};
