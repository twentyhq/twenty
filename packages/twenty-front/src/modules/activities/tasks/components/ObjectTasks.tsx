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

export const ObjectTasks = ({
  targetableObject,
}: {
  targetableObject: ActivityTargetableObject;
}) => {
  return (
    <StyledContainer>
      <ObjectFilterDropdownComponentInstanceContext.Provider
        value={{ instanceId: 'entity-tasks-filter-scope' }}
      >
        <TaskGroups targetableObjects={[targetableObject]} />
      </ObjectFilterDropdownComponentInstanceContext.Provider>
    </StyledContainer>
  );
};
