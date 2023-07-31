import { useTheme } from '@emotion/react';

import { TaskList } from '@/tasks/components/TaskList';
import { TasksContext } from '@/tasks/states/TasksContext';
import { IconArchive, IconCheck, IconCheckbox } from '@/ui/icon/index';
import { WithTopBarContainer } from '@/ui/layout/components/WithTopBarContainer';
import { TabList } from '@/ui/tab/components/TabList';
import { TopBar } from '@/ui/top-bar/TopBar';
import { RecoilScope } from '@/ui/utilities/recoil-scope/components/RecoilScope';

export function Tasks() {
  const theme = useTheme();

  return (
    <WithTopBarContainer
      title="Tasks"
      icon={<IconCheckbox size={theme.icon.size.md} />}
    >
      <RecoilScope SpecificContext={TasksContext}>
        <TopBar
          leftComponent={
            <TabList
              context={TasksContext}
              tabs={[
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
              ]}
            />
          }
        />
        <TaskList tasks={[]} />
      </RecoilScope>
    </WithTopBarContainer>
  );
}
