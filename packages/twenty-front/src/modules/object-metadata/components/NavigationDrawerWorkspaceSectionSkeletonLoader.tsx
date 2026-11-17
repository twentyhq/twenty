import { SkeletonLine } from '@/ui/feedback/skeleton/components/SkeletonLine';
import { NavigationDrawerSection } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerSection';
import { styled } from '@linaria/react';
import { SKELETON_HEIGHT_SIZES } from 'twenty-ui/primitives/feedback';
import { themeCssVariables } from 'twenty-ui/theme';

const NAVIGATION_ITEM_SKELETON_COUNT = 3;

// Sized like the section title and items, so nothing shifts when they mount.
const StyledRow = styled.div`
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  height: ${themeCssVariables.spacing[7]};
  justify-content: center;
  padding: 0 ${themeCssVariables.spacing[1]};
  width: 100%;
`;

export const NavigationDrawerWorkspaceSectionSkeletonLoader = () => {
  return (
    <NavigationDrawerSection>
      <StyledRow>
        <SkeletonLine
          width={72}
          height={SKELETON_HEIGHT_SIZES.xs}
          highlightColor={themeCssVariables.background.transparent.light}
        />
      </StyledRow>
      {Array.from({ length: NAVIGATION_ITEM_SKELETON_COUNT }).map(
        (_, index) => (
          <StyledRow key={index}>
            <SkeletonLine
              height={SKELETON_HEIGHT_SIZES.s}
              highlightColor={themeCssVariables.background.transparent.light}
            />
          </StyledRow>
        ),
      )}
    </NavigationDrawerSection>
  );
};
