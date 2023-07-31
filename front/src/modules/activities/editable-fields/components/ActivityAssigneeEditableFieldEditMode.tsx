import styled from '@emotion/styled';

import { ActivityAssigneePicker } from '@/activities/components/ActivityAssigneePicker';
import { useEditableField } from '@/ui/editable-field/hooks/useEditableField';
import { Activity, User } from '~/generated/graphql';

const StyledContainer = styled.div`
  left: 0px;
  position: absolute;
  top: -8px;
`;

export type OwnProps = {
  activity: Pick<Activity, 'id'> & {
    assignee?: Pick<User, 'id' | 'displayName'> | null;
  };
  onSubmit?: () => void;
  onCancel?: () => void;
};

export function ActivityAssigneeEditableFieldEditMode({
  activity,
  onSubmit,
  onCancel,
}: OwnProps) {
  const { closeEditableField } = useEditableField();

  function handleSubmit() {
    closeEditableField();
    onSubmit?.();
  }

  function handleCancel() {
    closeEditableField();
    onCancel?.();
  }

  return (
    <StyledContainer>
      <ActivityAssigneePicker
        activity={activity}
        onCancel={handleCancel}
        onSubmit={handleSubmit}
      />
    </StyledContainer>
  );
}
