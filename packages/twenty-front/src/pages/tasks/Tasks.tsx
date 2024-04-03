import styled from '@emotion/styled';
import { IconArchive, IconCheck, IconCheckbox } from 'twenty-ui';

import { TasksRecoilScopeContext } from '@/activities/states/recoil-scope-contexts/TasksRecoilScopeContext';
import { PageAddTaskButton } from '@/activities/tasks/components/PageAddTaskButton';
import { TaskGroups } from '@/activities/tasks/components/TaskGroups';
import { TASKS_TAB_LIST_COMPONENT_ID } from '@/activities/tasks/constants/TasksTabListComponentId';
import { ObjectFilterDropdownButton } from '@/object-record/object-filter-dropdown/components/ObjectFilterDropdownButton';
import { RelationPickerHotkeyScope } from '@/object-record/relation-picker/types/RelationPickerHotkeyScope';
import { PageBody } from '@/ui/layout/page/PageBody';
import { PageContainer } from '@/ui/layout/page/PageContainer';
import { PageHeader } from '@/ui/layout/page/PageHeader';
import { TabList } from '@/ui/layout/tab/components/TabList';
import { TopBar } from '@/ui/layout/top-bar/TopBar';
import { RecoilScope } from '@/ui/utilities/recoil-scope/components/RecoilScope';

import { TasksEffect } from './TasksEffect';

const StyledTasksContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  height: 100%;
  overflow: auto;
`;

const StyledTabListContainer = styled.div`
  align-items: end;
  display: flex;
  height: 40px;
  margin-left: ${({ theme }) => `-${theme.spacing(2)}`};
`;

export const Tasks = () => {
  const TASK_TABS = [
    {
      id: 'to-do',
      title: 'To do',
      Icon: IconCheck,
    },
    {
      id: 'done',
      title: 'Done',
      Icon: IconArchive,
    },
  ];

  const filterDropdownId = 'tasks-assignee-filter';

  return (
    <PageContainer>
      <RecoilScope CustomRecoilScopeContext={TasksRecoilScopeContext}>
        <TasksEffect filterDropdownId={filterDropdownId} />
        <PageHeader title="Tasks" Icon={IconCheckbox}>
          <PageAddTaskButton />
        </PageHeader>
        <PageBody>
          <StyledTasksContainer>
            <TopBar
              leftComponent={
                <StyledTabListContainer>
                  <TabList
                    tabListId={TASKS_TAB_LIST_COMPONENT_ID}
                    tabs={TASK_TABS}
                  />
                </StyledTabListContainer>
              }
              rightComponent={
                <ObjectFilterDropdownButton
                  filterDropdownId={filterDropdownId}
                  key="tasks-filter-dropdown-button"
                  hotkeyScope={{
                    scope: RelationPickerHotkeyScope.RelationPicker,
                  }}
                />
              }
            />
            <TaskGroups filterDropdownId={filterDropdownId} />
          </StyledTasksContainer>
        </PageBody>
      </RecoilScope>
    </PageContainer>
  );
};
