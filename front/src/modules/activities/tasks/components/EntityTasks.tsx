import styled from '@emotion/styled';

import { TasksRecoilScopeContext } from '@/activities/states/recoil-scope-contexts/TasksRecoilScopeContext';
import { TaskGroups } from '@/activities/tasks/components/TaskGroups';
import { ActivityTargetableEntity } from '@/activities/types/ActivityTargetableEntity';
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
  // FIXME: Changes introduced recently cause an error to be thrown in `TaskGroups` > `useFilter` > `useAvailableScopeIdOrThrow`
  // This is because the returned `scopeInternalContext` is `null` which means there's no `scopeId` to return.
  return (
    <StyledContainer>
      <RecoilScope CustomRecoilScopeContext={TasksRecoilScopeContext}>
        <TaskGroups entity={entity} showAddButton />
      </RecoilScope>
    </StyledContainer>
  );
};
