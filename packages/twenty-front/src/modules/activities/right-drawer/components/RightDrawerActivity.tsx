import React from 'react';
import styled from '@emotion/styled';
import { useSetRecoilState } from 'recoil';

import { ActivityEditor } from '@/activities/components/ActivityEditor';
import { Activity } from '@/activities/types/Activity';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';

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
  autoFillTitle?: boolean;
};

export const RightDrawerActivity = ({
  activityId,
  showComment = true,
  autoFillTitle = false,
}: RightDrawerActivityProps) => {
  const setEntityFields = useSetRecoilState(recordStoreFamilyState(activityId));

  const { record: activity } = useFindOneRecord({
    objectNameSingular: CoreObjectNameSingular.Activity,
    objectRecordId: activityId,
    skip: !activityId,
    onCompleted: (activity: Activity) => {
      setEntityFields(activity ?? {});
    },
  });

  if (!activity) {
    return <></>;
  }

  return (
    <StyledContainer>
      <ActivityEditor
        activity={activity}
        showComment={showComment}
        autoFillTitle={autoFillTitle}
      />
    </StyledContainer>
  );
};
