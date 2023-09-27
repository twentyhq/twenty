import React from 'react';
import styled from '@emotion/styled';
import { useRecoilState } from 'recoil';

import { ActivityEditor } from '@/activities/components/ActivityEditor';
import { entityFieldsFamilyState } from '@/ui/field/states/entityFieldsFamilyState';
import { useGetActivityQuery } from '~/generated/graphql';

import '@blocknote/core/style.css';

const StyledContainer = styled.div`
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  height: 100%;
  justify-content: space-between;
  overflow-y: auto;
  position: relative;
`;

type OwnProps = {
  activityId: string;
  showComment?: boolean;
  autoFillTitle?: boolean;
};

export const RightDrawerActivity = ({
  activityId,
  showComment = true,
  autoFillTitle = false,
}: OwnProps) => {
  const [, setEntityFields] = useRecoilState(
    entityFieldsFamilyState(activityId),
  );

  const { data } = useGetActivityQuery({
    variables: {
      activityId: activityId ?? '',
    },
    skip: !activityId,
    onCompleted: (data) => {
      setEntityFields(data?.findManyActivities[0] ?? {});
    },
  });

  const activity = data?.findManyActivities[0];

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
