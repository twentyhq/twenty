import { ActivityBodyEditor } from '@/activities/components/ActivityBodyEditor';
import styled from '@emotion/styled';

const StyledShowPageActivityContainer = styled.div`
  margin-top: ${({ theme }) => theme.spacing(2)};
  width: 100%;
`;
export const ShowPageActivityContainer = ({
  objectRecordId,
}: {
  objectRecordId: string;
}) => {
  return (
    <StyledShowPageActivityContainer>
      <ActivityBodyEditor
        activityId={objectRecordId}
        fillTitleFromBody={false}
      />
    </StyledShowPageActivityContainer>
  );
};
