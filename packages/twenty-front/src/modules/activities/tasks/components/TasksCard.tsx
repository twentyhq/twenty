import styled from '@emotion/styled';

import { TaskGroups } from '@/activities/tasks/components/TaskGroups';
import { ObjectFilterDropdownComponentInstanceContext } from '@/object-record/object-filter-dropdown/states/contexts/ObjectFilterDropdownComponentInstanceContext';
import { useTargetRecord } from '@/ui/layout/contexts/useTargetRecord';

const StyledContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  height: 100%;
  overflow: auto;
`;

export const TasksCard = () => {
  const targetRecord = useTargetRecord();

  return (
    <StyledContainer>
      <ObjectFilterDropdownComponentInstanceContext.Provider
        value={{ instanceId: 'entity-tasks-filter-instance' }}
      >
        <TaskGroups targetableObject={targetRecord} />
      </ObjectFilterDropdownComponentInstanceContext.Provider>
    </StyledContainer>
  );
};
