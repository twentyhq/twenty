import styled from '@emotion/styled';

import { TasksRecoilScopeContext } from '@/activities/states/recoil-scope-contexts/TasksRecoilScopeContext';
import { PageAddTaskButton } from '@/activities/tasks/components/PageAddTaskButton';
import { TaskGroups } from '@/activities/tasks/components/TaskGroups';
import { DropdownRecoilScopeContext } from '@/ui/dropdown/states/recoil-scope-contexts/DropdownRecoilScopeContext';
import { IconArchive, IconCheck, IconCheckbox } from '@/ui/icon/index';
import { RelationPickerHotkeyScope } from '@/ui/input/relation-picker/types/RelationPickerHotkeyScope';
import { PageBody } from '@/ui/layout/components/PageBody';
import { PageContainer } from '@/ui/layout/components/PageContainer';
import { PageHeader } from '@/ui/layout/components/PageHeader';
import { TabList } from '@/ui/tab/components/TabList';
import { TopBar } from '@/ui/top-bar/TopBar';
import { RecoilScope } from '@/ui/utilities/recoil-scope/components/RecoilScope';
import { FilterDropdownButton } from '@/ui/view-bar/components/FilterDropdownButton';

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
      <RecoilScope SpecificContext={DropdownRecoilScopeContext}>
        <RecoilScope SpecificContext={TasksRecoilScopeContext}>
          <TasksEffect />
          <PageHeader title="Tasks" Icon={IconCheckbox}>
            <PageAddTaskButton />
          </PageHeader>
          <PageBody>
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
                    context={TasksRecoilScopeContext}
                    hotkeyScope={{
                      scope: RelationPickerHotkeyScope.RelationPicker,
                    }}
                  />
                }
              />
              <TaskGroups />
            </StyledTasksContainer>
          </PageBody>
        </RecoilScope>
      </RecoilScope>
    </PageContainer>
  );
};
