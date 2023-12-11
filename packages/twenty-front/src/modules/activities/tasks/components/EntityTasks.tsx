import styled from '@emotion/styled';

import { TasksRecoilScopeContext } from '@/activities/states/recoil-scope-contexts/TasksRecoilScopeContext';
import { TaskGroups } from '@/activities/tasks/components/TaskGroups';
import { ActivityTargetableEntity } from '@/activities/types/ActivityTargetableEntity';
import { ObjectFilterDropdownScope } from '@/object-record/object-filter-dropdown/scopes/ObjectFilterDropdownScope';
import { RecoilScope } from '@/ui/utilities/recoil-scope/components/RecoilScope';

const StyledContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  height: 100%;
  overflow: auto;
`;

export const EntityTasks = ({
  entity,
}: {
  entity: ActivityTargetableEntity;
}) => {
  return (
    <StyledContainer>
      <RecoilScope CustomRecoilScopeContext={TasksRecoilScopeContext}>
        <ObjectFilterDropdownScope filterScopeId="entity-tasks-filter-scope">
          <TaskGroups entity={entity} showAddButton />
        </ObjectFilterDropdownScope>
      </RecoilScope>
    </StyledContainer>
  );
};
