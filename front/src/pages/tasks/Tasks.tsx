import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';

import { TaskGroups } from '@/tasks/components/TaskGroups';
import { TasksContext } from '@/tasks/states/TasksContext';
import { IconArchive, IconCheck, IconCheckbox } from '@/ui/icon/index';
import { WithTopBarContainer } from '@/ui/layout/components/WithTopBarContainer';
import { TabList } from '@/ui/tab/components/TabList';
import { TopBar } from '@/ui/top-bar/TopBar';
import { RecoilScope } from '@/ui/utilities/recoil-scope/components/RecoilScope';

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
    <WithTopBarContainer
      title="Tasks"
      icon={<IconCheckbox size={theme.icon.size.md} />}
    >
      <StyledTasksContainer>
        <RecoilScope SpecificContext={TasksContext}>
          <TopBar
            leftComponent={
              <StyledTabListContainer>
                <TabList context={TasksContext} tabs={TASK_TABS} />
              </StyledTabListContainer>
            }
          />
          <TaskGroups />
        </RecoilScope>
      </StyledTasksContainer>
    </WithTopBarContainer>
  );
}
