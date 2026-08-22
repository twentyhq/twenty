import { TaskGroups } from '@/activities/tasks/components/TaskGroups';
import { ObjectFilterDropdownComponentInstanceContext } from '@/object-record/object-filter-dropdown/states/contexts/ObjectFilterDropdownComponentInstanceContext';
import { StyledWidgetScrollContainer } from '@/ui/layout/components/WidgetContentContainer';
import { useTargetRecord } from '@/ui/layout/contexts/useTargetRecord';

export const TasksCard = () => {
  const targetRecord = useTargetRecord();

  return (
    <StyledWidgetScrollContainer>
      <ObjectFilterDropdownComponentInstanceContext.Provider
        value={{ instanceId: 'entity-tasks-filter-instance' }}
      >
        <TaskGroups targetableObject={targetRecord} />
      </ObjectFilterDropdownComponentInstanceContext.Provider>
    </StyledWidgetScrollContainer>
  );
};
