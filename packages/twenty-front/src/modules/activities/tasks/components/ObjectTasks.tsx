import styled from '@emotion/styled';

import { TaskGroups } from '@/activities/tasks/components/TaskGroups';
import { ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { ObjectFilterDropdownScope } from '@/object-record/object-filter-dropdown/scopes/ObjectFilterDropdownScope';

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
      <ObjectFilterDropdownScope filterScopeId="entity-tasks-filter-scope">
        <TaskGroups targetableObjects={[targetableObject]} />
      </ObjectFilterDropdownScope>
    </StyledContainer>
  );
};
