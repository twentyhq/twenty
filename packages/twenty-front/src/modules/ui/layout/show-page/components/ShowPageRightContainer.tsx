import styled from '@emotion/styled';
import { useRecoilValue } from 'recoil';
import {
  IconCalendarEvent,
  IconCheckbox,
  IconMail,
  IconNotes,
  IconPaperclip,
  IconTimelineEvent,
} from 'twenty-ui';

import { Calendar } from '@/activities/calendar/components/Calendar';
import { EmailThreads } from '@/activities/emails/components/EmailThreads';
import { Attachments } from '@/activities/files/components/Attachments';
import { Notes } from '@/activities/notes/components/Notes';
import { ObjectTasks } from '@/activities/tasks/components/ObjectTasks';
import { Timeline } from '@/activities/timeline/components/Timeline';
import { TimelineQueryEffect } from '@/activities/timeline/components/TimelineQueryEffect';
import { TimelineActivities } from '@/activities/timelineActivities/components/TimelineActivities';
import { ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { TabList } from '@/ui/layout/tab/components/TabList';
import { useTabList } from '@/ui/layout/tab/hooks/useTabList';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';

const StyledShowPageRightContainer = styled.div<{ isMobile: boolean }>`
  display: flex;
  flex: 1 0 0;
  flex-direction: column;
  justify-content: start;
  overflow: ${(isMobile) => (isMobile ? 'none' : 'hidden')};
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

export const TAB_LIST_COMPONENT_ID = 'show-page-right-tab-list';

type ShowPageRightContainerProps = {
  targetableObject: Pick<
    ActivityTargetableObject,
    'targetObjectNameSingular' | 'id'
  >;
  timeline?: boolean;
  tasks?: boolean;
  notes?: boolean;
  emails?: boolean;
  summary?: JSX.Element;
  isRightDrawer?: boolean;
  loading: boolean;
};

export const ShowPageRightContainer = ({
  targetableObject,
  timeline,
  tasks,
  notes,
  emails,
  loading,
  summary,
  isRightDrawer = false,
}: ShowPageRightContainerProps) => {
  const { activeTabIdState } = useTabList(
    TAB_LIST_COMPONENT_ID + isRightDrawer,
  );
  const activeTabId = useRecoilValue(activeTabIdState);

  const shouldDisplayCalendarTab =
    targetableObject.targetObjectNameSingular ===
      CoreObjectNameSingular.Company ||
    targetableObject.targetObjectNameSingular === CoreObjectNameSingular.Person;

  const shouldDisplayLogTab = useIsFeatureEnabled('IS_EVENT_OBJECT_ENABLED');

  const shouldDisplayEmailsTab =
    (emails &&
      targetableObject.targetObjectNameSingular ===
        CoreObjectNameSingular.Company) ||
    targetableObject.targetObjectNameSingular === CoreObjectNameSingular.Person;

  const isMobile = useIsMobile() || isRightDrawer;

  const TASK_TABS = [
    {
      id: 'summary',
      title: 'Summary',
      Icon: IconCheckbox,
      hide: !isMobile,
    },
    {
      id: 'timeline',
      title: 'Timeline',
      Icon: IconTimelineEvent,
      hide: !timeline || isRightDrawer,
    },
    {
      id: 'tasks',
      title: 'Tasks',
      Icon: IconCheckbox,
      hide: !tasks,
    },
    {
      id: 'notes',
      title: 'Notes',
      Icon: IconNotes,
      hide: !notes,
    },
    {
      id: 'files',
      title: 'Files',
      Icon: IconPaperclip,
      hide: !notes,
    },
    {
      id: 'emails',
      title: 'Emails',
      Icon: IconMail,
      hide: !shouldDisplayEmailsTab,
    },
    {
      id: 'calendar',
      title: 'Calendar',
      Icon: IconCalendarEvent,
      hide: !shouldDisplayCalendarTab,
    },
    {
      id: 'logs',
      title: 'Logs',
      Icon: IconTimelineEvent,
      hide: !shouldDisplayLogTab,
      hasBetaPill: true,
    },
  ];

  return (
    <StyledShowPageRightContainer isMobile={isMobile}>
      <StyledTabListContainer>
        <TabList
          loading={loading}
          tabListId={TAB_LIST_COMPONENT_ID + isRightDrawer}
          tabs={TASK_TABS}
        />
      </StyledTabListContainer>
      {activeTabId === 'summary' && summary}
      {activeTabId === 'timeline' && (
        <>
          <TimelineQueryEffect targetableObject={targetableObject} />
          <Timeline loading={loading} targetableObject={targetableObject} />
        </>
      )}
      {activeTabId === 'tasks' && (
        <ObjectTasks targetableObject={targetableObject} />
      )}
      {activeTabId === 'notes' && <Notes targetableObject={targetableObject} />}
      {activeTabId === 'files' && (
        <Attachments targetableObject={targetableObject} />
      )}
      {activeTabId === 'emails' && (
        <EmailThreads targetableObject={targetableObject} />
      )}
      {activeTabId === 'calendar' && (
        <Calendar targetableObject={targetableObject} />
      )}
      {activeTabId === 'logs' && (
        <TimelineActivities targetableObject={targetableObject} />
      )}
      {}
    </StyledShowPageRightContainer>
  );
};
