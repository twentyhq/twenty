import { SKELETON_LOADER_HEIGHT_SIZES } from '@/activities/components/SkeletonLoader';
import { viewableRichTextComponentState } from '@/side-panel/pages/rich-text-page/states/viewableRichTextComponentState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { styled } from '@linaria/react';
import { lazy, Suspense, useContext } from 'react';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';

const ActivityRichTextEditor = lazy(() =>
  import('@/activities/components/ActivityRichTextEditor').then((module) => ({
    default: module.ActivityRichTextEditor,
  })),
);

const StyledContainer = styled.div`
  box-sizing: border-box;
  margin: ${themeCssVariables.spacing[4]} -8px;
  padding-inline: 44px 0px;
  width: 100%;
`;

const LoadingSkeleton = () => {
  const { theme } = useContext(ThemeContext);
  return (
    <SkeletonTheme
      baseColor={theme.background.tertiary}
      highlightColor={theme.background.transparent.lighter}
      borderRadius={theme.border.radius.sm}
    >
      <Skeleton height={SKELETON_LOADER_HEIGHT_SIZES.standard.s} />
    </SkeletonTheme>
  );
};

export const SidePanelEditRichTextPage = () => {
  const { activityId, activityObjectNameSingular } = useAtomStateValue(
    viewableRichTextComponentState,
  );

  if (
    activityObjectNameSingular !== CoreObjectNameSingular.Note &&
    activityObjectNameSingular !== CoreObjectNameSingular.Task
  ) {
    throw new Error(
      `Invalid activity object name singular: ${activityObjectNameSingular}`,
    );
  }

  return (
    <StyledContainer>
      <Suspense fallback={<LoadingSkeleton />}>
        <ActivityRichTextEditor
          activityId={activityId}
          activityObjectNameSingular={activityObjectNameSingular}
        />
      </Suspense>
    </StyledContainer>
  );
};
