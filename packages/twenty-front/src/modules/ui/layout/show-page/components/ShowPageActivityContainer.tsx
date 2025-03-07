import { ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { isNewViewableRecordLoadingState } from '@/object-record/record-right-drawer/states/isNewViewableRecordLoading';
import { ScrollWrapper } from '@/ui/utilities/scroll/components/ScrollWrapper';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { lazy, Suspense } from 'react';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import { useRecoilValue } from 'recoil';

const ActivityRichTextEditor = lazy(() =>
  import('@/activities/components/ActivityRichTextEditor').then((module) => ({
    default: module.ActivityRichTextEditor,
  })),
);

const StyledShowPageActivityContainer = styled.div`
  margin-top: ${({ theme }) => theme.spacing(6)};
  width: 100%;
`;

const StyledSkeletonContainer = styled.div`
  width: 100%;
`;

const LoadingSkeleton = () => {
  const theme = useTheme();

  return (
    <StyledSkeletonContainer>
      <SkeletonTheme
        baseColor={theme.background.tertiary}
        highlightColor={theme.background.transparent.lighter}
        borderRadius={theme.border.radius.sm}
      >
        <Skeleton height={200} />
      </SkeletonTheme>
    </StyledSkeletonContainer>
  );
};

export const ShowPageActivityContainer = ({
  targetableObject,
}: {
  targetableObject: Pick<
    ActivityTargetableObject,
    'targetObjectNameSingular' | 'id'
  >;
}) => {
  const isNewViewableRecordLoading = useRecoilValue(
    isNewViewableRecordLoadingState,
  );

  return !isNewViewableRecordLoading ? (
    <ScrollWrapper
      contextProviderName="showPageActivityContainer"
      componentInstanceId={`scroll-wrapper-tab-list-${targetableObject.id}`}
    >
      <StyledShowPageActivityContainer>
        <Suspense fallback={<LoadingSkeleton />}>
          <ActivityRichTextEditor
            activityId={targetableObject.id}
            activityObjectNameSingular={
              targetableObject.targetObjectNameSingular as
                | CoreObjectNameSingular.Note
                | CoreObjectNameSingular.Task
            }
          />
        </Suspense>
      </StyledShowPageActivityContainer>
    </ScrollWrapper>
  ) : (
    <></>
  );
};
