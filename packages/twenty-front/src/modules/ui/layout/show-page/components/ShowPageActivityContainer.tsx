import { SKELETON_LOADER_HEIGHT_SIZES } from '@/activities/components/SkeletonLoader';
import { ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { recordStoreFamilySelector } from '@/object-record/record-store/states/selectors/recordStoreFamilySelector';
import { ScrollWrapper } from '@/ui/utilities/scroll/components/ScrollWrapper';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { lazy, Suspense } from 'react';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared/utils';

const ActivityRichTextEditor = lazy(() =>
  import('@/activities/components/ActivityRichTextEditor').then((module) => ({
    default: module.ActivityRichTextEditor,
  })),
);

const StyledShowPageActivityContainer = styled.div`
  margin-top: ${({ theme }) => theme.spacing(6)};
  width: 100%;
  padding-inline: 44px;
  box-sizing: border-box;
`;

const StyledSkeletonContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing(0, 4)};
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
        <Skeleton height={SKELETON_LOADER_HEIGHT_SIZES.standard.s} />
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
  const activityObjectNameSingular =
    targetableObject.targetObjectNameSingular as
      | CoreObjectNameSingular.Note
      | CoreObjectNameSingular.Task;

  const activityBodyV2 = useRecoilValue(
    recordStoreFamilySelector({
      recordId: targetableObject.id,
      fieldName: 'bodyV2',
    }),
  );

  if (!isDefined(activityBodyV2)) {
    return <LoadingSkeleton />;
  }

  return (
    <ScrollWrapper
      componentInstanceId={`scroll-wrapper-tab-list-${targetableObject.id}`}
    >
      <StyledShowPageActivityContainer>
        <Suspense fallback={<LoadingSkeleton />}>
          <ActivityRichTextEditor
            activityId={targetableObject.id}
            activityObjectNameSingular={activityObjectNameSingular}
          />
        </Suspense>
      </StyledShowPageActivityContainer>
    </ScrollWrapper>
  );
};
