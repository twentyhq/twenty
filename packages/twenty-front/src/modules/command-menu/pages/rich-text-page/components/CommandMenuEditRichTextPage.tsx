import { SKELETON_LOADER_HEIGHT_SIZES } from '@/activities/components/SkeletonLoader';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { lazy, Suspense } from 'react';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import { useRecoilValue } from 'recoil';
import { viewableRichTextComponentState } from '@/command-menu/pages/rich-text-page/states/viewableRichTextComponentState';

const ActivityRichTextEditor = lazy(() =>
  import('@/activities/components/ActivityRichTextEditor').then((module) => ({
    default: module.ActivityRichTextEditor,
  })),
);

const StyledContainer = styled.div`
  box-sizing: border-box;
  margin: ${({ theme }) => theme.spacing(4)} ${({ theme }) => theme.spacing(-2)};
  padding-inline: 44px 0px;
  width: 100%;
`;

const LoadingSkeleton = () => {
  const theme = useTheme();

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

export const CommandMenuEditRichTextPage = () => {
  const { activityId, activityObjectNameSingular } = useRecoilValue(
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
