import { ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { isNewViewableRecordLoadingState } from '@/object-record/record-right-drawer/states/isNewViewableRecordLoading';
import { ScrollWrapper } from '@/ui/utilities/scroll/components/ScrollWrapper';
import styled from '@emotion/styled';
import { lazy } from 'react';
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
        <ActivityRichTextEditor
          activityId={targetableObject.id}
          activityObjectNameSingular={
            targetableObject.targetObjectNameSingular as
              | CoreObjectNameSingular.Note
              | CoreObjectNameSingular.Task
          }
        />
      </StyledShowPageActivityContainer>
    </ScrollWrapper>
  ) : (
    <></>
  );
};
