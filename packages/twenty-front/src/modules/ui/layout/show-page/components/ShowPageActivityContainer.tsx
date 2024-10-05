import { RichTextEditor } from '@/activities/components/RichTextEditor';
import { ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { isNewViewableRecordLoadingState } from '@/object-record/record-right-drawer/states/isNewViewableRecordLoading';
import { ScrollWrapper } from '@/ui/utilities/scroll/components/ScrollWrapper';
import styled from '@emotion/styled';
import { useRecoilValue } from 'recoil';

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
    <ScrollWrapper contextProviderName="showPageActivityContainer">
      <StyledShowPageActivityContainer>
        <RichTextEditor
          activityId={targetableObject.id}
          fillTitleFromBody={false}
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
