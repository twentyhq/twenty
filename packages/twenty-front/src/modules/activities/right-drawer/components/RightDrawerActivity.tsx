import styled from '@emotion/styled';

import { ActivityEditor } from '@/activities/components/ActivityEditor';
import { ActivityEditorEffect } from '@/activities/components/ActivityEditorEffect';

const StyledContainer = styled.div`
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  height: 100%;
  justify-content: space-between;
  overflow-y: auto;
  position: relative;
`;

type RightDrawerActivityProps = {
  activityId: string;
  showComment?: boolean;
  fillTitleFromBody?: boolean;
};

export const RightDrawerActivity = ({
  activityId,
  showComment = true,
  fillTitleFromBody = false,
}: RightDrawerActivityProps) => {
  return (
    <StyledContainer>
      <ActivityEditorEffect activityId={activityId} />
      <ActivityEditor
        activityId={activityId}
        showComment={showComment}
        fillTitleFromBody={fillTitleFromBody}
      />
    </StyledContainer>
  );
};
