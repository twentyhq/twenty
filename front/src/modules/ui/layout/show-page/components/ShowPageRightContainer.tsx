import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';

import { Timeline } from '@/activities/timeline/components/Timeline';
import { ActivityTargetableEntity } from '@/activities/types/ActivityTargetableEntity';
import {
  IconCheckbox,
  IconMail,
  IconNotes,
  IconTimelineEvent,
} from '@/ui/icon';
import { TabList } from '@/ui/tab/components/TabList';
import { activeTabIdScopedState } from '@/ui/tab/states/activeTabIdScopedState';
import { useRecoilScopedState } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedState';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';

import { ShowPageRecoilScopeContext } from '../../states/ShowPageRecoilScopeContext';

import { ShowPageNotes } from './notes/ShowPageNotes';
import { ShowPageTasks } from './tasks/ShowPageTasks';

const StyledShowPageRightContainer = styled.div`
  display: flex;
  flex: 1 0 0;
  flex-direction: column;
  justify-content: center;
  overflow: ${() => (useIsMobile() ? 'none' : 'hidden')};
  width: ${({ theme }) => {
    const isMobile = useIsMobile();

    return isMobile ? `calc(100% - ${theme.spacing(6)})` : 'auto';
  }};
`;

const StyledTabListContainer = styled.div`
  align-items: end;
  border-bottom: ${({ theme }) => `1px solid ${theme.border.color.light}`};
  box-sizing: border-box;
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
  height: 40px;
  padding-left: ${({ theme }) => theme.spacing(1)};
  padding-right: ${({ theme }) => theme.spacing(1)};
`;

type OwnProps = {
  entity: ActivityTargetableEntity;
  timeline?: boolean;
  tasks?: boolean;
  notes?: boolean;
  emails?: boolean;
};

export function ShowPageRightContainer({
  entity,
  timeline,
  tasks,
  notes,
  emails,
}: OwnProps) {
  const theme = useTheme();

  const TASK_TABS = [
    {
      id: 'timeline',
      title: 'Timeline',
      icon: <IconTimelineEvent size={theme.icon.size.md} />,
      show: !timeline,
    },
    {
      id: 'tasks',
      title: 'Tasks',
      icon: <IconCheckbox size={theme.icon.size.md} />,
      show: !tasks,
    },
    {
      id: 'notes',
      title: 'Notes',
      icon: <IconNotes size={theme.icon.size.md} />,
      show: !notes,
    },
    {
      id: 'emails',
      title: 'Emails',
      icon: <IconMail size={theme.icon.size.md} />,
      show: !emails,
      disabled: true,
    },
  ];

  const [activeTabId] = useRecoilScopedState(
    activeTabIdScopedState,
    ShowPageRecoilScopeContext,
  );

  return (
    <StyledShowPageRightContainer>
      <StyledTabListContainer>
        <TabList context={ShowPageRecoilScopeContext} tabs={TASK_TABS} />
      </StyledTabListContainer>
      {activeTabId === 'timeline' && <Timeline entity={entity} />}
      {activeTabId === 'tasks' && <ShowPageTasks entity={entity} />}
      {activeTabId === 'notes' && <ShowPageNotes entity={entity} />}
    </StyledShowPageRightContainer>
  );
}
