import styled from '@emotion/styled';

import { Threads } from '@/activities/emails/components/Threads';
import { Attachments } from '@/activities/files/components/Attachments';
import { Notes } from '@/activities/notes/components/Notes';
import { EntityTasks } from '@/activities/tasks/components/EntityTasks';
import { Timeline } from '@/activities/timeline/components/Timeline';
import { ActivityTargetableEntity } from '@/activities/types/ActivityTargetableEntity';
import {
  IconCheckbox,
  IconMail,
  IconNotes,
  IconPaperclip,
  IconTimelineEvent,
} from '@/ui/display/icon';
import { TabList } from '@/ui/layout/tab/components/TabList';
import { activeTabIdScopedState } from '@/ui/layout/tab/states/activeTabIdScopedState';
import { useRecoilScopedState } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedState';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';

import { ShowPageRecoilScopeContext } from '../../states/ShowPageRecoilScopeContext';

const StyledShowPageRightContainer = styled.div`
  display: flex;
  flex: 1 0 0;
  flex-direction: column;
  justify-content: start;
  overflow: ${() => (useIsMobile() ? 'none' : 'hidden')};
  width: calc(100% + 4px);
`;

const StyledTabListContainer = styled.div`
  align-items: center;
  border-bottom: ${({ theme }) => `1px solid ${theme.border.color.light}`};
  box-sizing: border-box;
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  height: 40px;
`;

type ShowPageRightContainerProps = {
  entity?: ActivityTargetableEntity;
  timeline?: boolean;
  tasks?: boolean;
  notes?: boolean;
  emails?: boolean;
};

export const ShowPageRightContainer = ({
  entity,
  timeline,
  tasks,
  notes,
  emails,
}: ShowPageRightContainerProps) => {
  const isMessagingEnabled = useIsFeatureEnabled('IS_MESSAGING_ENABLED');
  const [activeTabId] = useRecoilScopedState(
    activeTabIdScopedState,
    ShowPageRecoilScopeContext,
  );

  if (!entity) return <></>;
  const TASK_TABS = [
    {
      id: 'timeline',
      title: 'Timeline',
      Icon: IconTimelineEvent,
      hide: !timeline,
      disabled: entity.type === 'Custom',
    },
    {
      id: 'tasks',
      title: 'Tasks',
      Icon: IconCheckbox,
      hide: !tasks,
      disabled: entity.type === 'Custom',
    },
    {
      id: 'notes',
      title: 'Notes',
      Icon: IconNotes,
      hide: !notes,
      disabled: entity.type === 'Custom',
    },
    {
      id: 'files',
      title: 'Files',
      Icon: IconPaperclip,
      hide: !notes,
      disabled: entity.type === 'Custom',
    },
    {
      id: 'emails',
      title: 'Emails',
      Icon: IconMail,
      hide: !emails,
      disabled: !isMessagingEnabled || entity.type === 'Custom',
    },
  ];

  return (
    <StyledShowPageRightContainer>
      <StyledTabListContainer>
        <TabList context={ShowPageRecoilScopeContext} tabs={TASK_TABS} />
      </StyledTabListContainer>
      {activeTabId === 'timeline' && <Timeline entity={entity} />}
      {activeTabId === 'tasks' && <EntityTasks entity={entity} />}
      {activeTabId === 'notes' && <Notes entity={entity} />}
      {activeTabId === 'files' && <Attachments targetableEntity={entity} />}
      {activeTabId === 'emails' && <Threads entity={entity} />}
    </StyledShowPageRightContainer>
  );
};
