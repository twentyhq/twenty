import styled from '@emotion/styled';

import { TasksRecoilScopeContext } from '@/activities/states/recoil-scope-contexts/TasksRecoilScopeContext';
import { PageAddTaskButton } from '@/activities/tasks/components/PageAddTaskButton';
import { TaskGroups } from '@/activities/tasks/components/TaskGroups';
import { FilterDropdownButton } from '@/ui/Data/View Bar/components/FilterDropdownButton';
import { ViewBarContext } from '@/ui/Data/View Bar/contexts/ViewBarContext';
import { IconArchive, IconCheck, IconCheckbox } from '@/ui/Display/Icon/index';
import { RelationPickerHotkeyScope } from '@/ui/Input/Relation Picker/types/RelationPickerHotkeyScope';
import { PageBody } from '@/ui/Layout/Page/PageBody';
import { PageContainer } from '@/ui/Layout/Page/PageContainer';
import { PageHeader } from '@/ui/Layout/Page/PageHeader';
import { TabList } from '@/ui/Layout/Tab/components/TabList';
import { TopBar } from '@/ui/Layout/Top Bar/TopBar';
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

  return (
    <PageContainer>
      <RecoilScope CustomRecoilScopeContext={TasksRecoilScopeContext}>
        <TasksEffect />
        <PageHeader title="Tasks" Icon={IconCheckbox}>
          <PageAddTaskButton />
        </PageHeader>
        <PageBody>
          {/* TODO: we should refactor filters as a standalone module ? */}
          <ViewBarContext.Provider
            value={{
              ViewBarRecoilScopeContext: TasksRecoilScopeContext,
            }}
          >
            <StyledTasksContainer>
              <TopBar
                leftComponent={
                  <StyledTabListContainer>
                    <TabList
                      context={TasksRecoilScopeContext}
                      tabs={TASK_TABS}
                    />
                  </StyledTabListContainer>
                }
                rightComponent={
                  <FilterDropdownButton
                    key="tasks-filter-dropdown-button"
                    hotkeyScope={{
                      scope: RelationPickerHotkeyScope.RelationPicker,
                    }}
                  />
                }
              />
              <TaskGroups />
            </StyledTasksContainer>
          </ViewBarContext.Provider>
        </PageBody>
      </RecoilScope>
    </PageContainer>
  );
};
