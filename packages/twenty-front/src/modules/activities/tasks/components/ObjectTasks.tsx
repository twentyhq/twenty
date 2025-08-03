import styled from '@emotion/styled';

import { TaskGroups } from '@/activities/tasks/components/TaskGroups';
import { ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { ObjectFilterDropdownComponentInstanceContext } from '@/object-record/object-filter-dropdown/states/contexts/ObjectFilterDropdownComponentInstanceContext';

const StyledContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  height: 100%;
  overflow: auto;
`;

type ObjectTasksProps = {
  targetableObject: ActivityTargetableObject;
};

export const ObjectTasks = ({ targetableObject }: ObjectTasksProps) => {
  return (
    <StyledContainer>
      <ObjectFilterDropdownComponentInstanceContext.Provider
        value={{ instanceId: 'entity-tasks-filter-instance' }}
      >
        <TaskGroups targetableObject={targetableObject} />
      </ObjectFilterDropdownComponentInstanceContext.Provider>
    </StyledContainer>
  );
};
