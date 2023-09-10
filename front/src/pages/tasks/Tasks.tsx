import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';

import { useOpenCreateActivityDrawer } from '@/activities/hooks/useOpenCreateActivityDrawer';
import { TasksRecoilScopeContext } from '@/activities/states/recoil-scope-contexts/TasksRecoilScopeContext';
import { TaskGroups } from '@/activities/tasks/components/TaskGroups';
import { DropdownRecoilScopeContext } from '@/ui/dropdown/states/recoil-scope-contexts/DropdownRecoilScopeContext';
import { IconArchive, IconCheck, IconCheckbox } from '@/ui/icon/index';
import { PageAddButton } from '@/ui/layout/components/PageAddButton';
import { PageBody } from '@/ui/layout/components/PageBody';
import { PageContainer } from '@/ui/layout/components/PageContainer';
import { PageHeader } from '@/ui/layout/components/PageHeader';
import { TabList } from '@/ui/tab/components/TabList';
import { TopBar } from '@/ui/top-bar/TopBar';
import { RecoilScope } from '@/ui/utilities/recoil-scope/components/RecoilScope';
import { FilterDropdownButton } from '@/ui/view-bar/components/FilterDropdownButton';
import { FiltersHotkeyScope } from '@/ui/view-bar/types/FiltersHotkeyScope';
import { ActivityType } from '~/generated/graphql';

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
  const openCreateActivity = useOpenCreateActivityDrawer();

  const TASK_TABS = [
    {
      id: 'to-do',
      title: 'To do',
      Icon: IconCheck,
      iconProps: { size: theme.icon.size.md },
    },
    {
      id: 'done',
      title: 'Done',
      Icon: IconArchive,
      iconProps: { size: theme.icon.size.md },
    },
  ];

  return (
    <PageContainer>
      <PageHeader
        title="Tasks"
        Icon={IconCheckbox}
        iconProps={{ size: theme.icon.size.md }}
      >
        <RecoilScope SpecificContext={DropdownRecoilScopeContext}>
          <PageAddButton
            onClick={() => openCreateActivity(ActivityType.Task)}
          />
        </RecoilScope>
      </PageHeader>
      <PageBody>
        <StyledTasksContainer>
          <RecoilScope SpecificContext={TasksRecoilScopeContext}>
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
                  hotkeyScope={FiltersHotkeyScope.FilterDropdownButton}
                />
              }
            />
            <TaskGroups />
          </RecoilScope>
        </StyledTasksContainer>
      </PageBody>
    </PageContainer>
  );
}
