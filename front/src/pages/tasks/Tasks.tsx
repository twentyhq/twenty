import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';

import { TasksRecoilScopeContext } from '@/activities/states/recoil-scope-contexts/TasksRecoilScopeContext';
import { PageAddTaskButton } from '@/activities/tasks/components/PageAddTaskButton';
import { TaskGroups } from '@/activities/tasks/components/TaskGroups';
import { IconArchive, IconCheck, IconCheckbox } from '@/ui/icon/index';
import { PageBody } from '@/ui/layout/components/PageBody';
import { PageContainer } from '@/ui/layout/components/PageContainer';
import { PageHeader } from '@/ui/layout/components/PageHeader';
import { TabList } from '@/ui/tab/components/TabList';
import { TopBar } from '@/ui/top-bar/TopBar';
import { RecoilScope } from '@/ui/utilities/recoil-scope/components/RecoilScope';
import { FilterDropdownButton } from '@/ui/view-bar/components/FilterDropdownButton';
import { FiltersHotkeyScope } from '@/ui/view-bar/types/FiltersHotkeyScope';

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
`;

export function Tasks() {
  const theme = useTheme();

  const TASK_TABS = [
    {
      id: 'to-do',
      title: 'To do',
      icon: <IconCheck size={theme.icon.size.md} />,
    },
    {
      id: 'done',
      title: 'Done',
      icon: <IconArchive size={theme.icon.size.md} />,
    },
  ];

  return (
    <PageContainer>
      <RecoilScope SpecificContext={TasksRecoilScopeContext}>
        <PageHeader
          title="Tasks"
          icon={<IconCheckbox size={theme.icon.size.md} />}
        >
          <PageAddTaskButton />
        </PageHeader>
        <PageBody>
          <StyledTasksContainer>
            <TopBar
              leftComponent={
                <StyledTabListContainer>
                  <TabList context={TasksRecoilScopeContext} tabs={TASK_TABS} />
                </StyledTabListContainer>
              }
              rightComponent={
                <FilterDropdownButton
                  key="tasks-filter-dropdown-button"
                  context={TasksRecoilScopeContext}
                  HotkeyScope={FiltersHotkeyScope.FilterDropdownButton}
                />
              }
            />
            <TaskGroups />
          </StyledTasksContainer>
        </PageBody>
      </RecoilScope>
    </PageContainer>
  );
}
