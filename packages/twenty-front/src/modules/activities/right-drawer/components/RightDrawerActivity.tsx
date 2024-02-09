import styled from '@emotion/styled';

import { ActivityEditor } from '@/activities/components/ActivityEditor';
import { useActivityById } from '@/activities/hooks/useActivityById';

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
  const { activity } = useActivityById({
    activityId,
  });

  if (!activity) {
    return <></>;
  }

  return (
    <StyledContainer>
      <ActivityEditor
        activity={activity}
        showComment={showComment}
        fillTitleFromBody={fillTitleFromBody}
      />
    </StyledContainer>
  );
};
