import { ActivityBodyEditor } from '@/activities/components/ActivityBodyEditor';
import { ActivityBodyEffect } from '@/activities/components/ActivityBodyEffect';
import { ActivityEditorEffect } from '@/activities/components/ActivityEditorEffect';
import { RecordValueSetterEffect } from '@/object-record/record-store/components/RecordValueSetterEffect';
import styled from '@emotion/styled';

const StyledShowPageActivityContainer = styled.div`
  margin-top: ${({ theme }) => theme.spacing(2)};
  width: 100%;
`;
export const ShowPageActivityContainer = (objectRecordId: string) => {
  return (
    <StyledShowPageActivityContainer>
      <RecordValueSetterEffect recordId={objectRecordId} />
      <ActivityEditorEffect activityId={objectRecordId} />
      <ActivityBodyEffect activityId={objectRecordId} />
      <ActivityBodyEditor
        activityId={objectRecordId}
        fillTitleFromBody={false}
      />
    </StyledShowPageActivityContainer>
  );
};
