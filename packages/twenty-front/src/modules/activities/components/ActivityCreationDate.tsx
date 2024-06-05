import styled from '@emotion/styled';
import { useRecoilState } from 'recoil';

import { Activity } from '@/activities/types/Activity';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { beautifyPastDateRelativeToNow } from '~/utils/date-utils';

const StyledCreationDisplay = styled.span`
  color: ${({ theme }) => theme.font.color.light};
  display: flex;
  font-size: ${({ theme }) => theme.font.size.sm};
  user-select: none;
  width: 100%;
`;

type ActivityCreationDateProps = {
  activityId: string;
};

export const ActivityCreationDate = ({
  activityId,
}: ActivityCreationDateProps) => {
  const [activityInStore] = useRecoilState(recordStoreFamilyState(activityId));
  const activity = activityInStore as Activity;

  const beautifiedDate = activity.createdAt
    ? beautifyPastDateRelativeToNow(activity.createdAt)
    : null;

  const authorName = activity.author?.name
    ? `${activity.author.name.firstName} ${activity.author.name.lastName}`
    : null;

  if (!activity.createdAt || !authorName) {
    return <></>;
  }

  return (
    <StyledCreationDisplay>
      Created {beautifiedDate} by {authorName}
    </StyledCreationDisplay>
  );
};
