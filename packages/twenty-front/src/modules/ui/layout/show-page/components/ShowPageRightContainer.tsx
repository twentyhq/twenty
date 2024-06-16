import styled from '@emotion/styled';
import { useRecoilValue } from 'recoil';
import {
  IconCalendarEvent,
  IconCheckbox,
  IconHome,
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
import { TimelineActivities } from '@/activities/timelineActivities/components/TimelineActivities';
import { TimelineActivitiesQueryEffect } from '@/activities/timelineActivities/components/TimelineActivitiesQueryEffect';
import { ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { TabList } from '@/ui/layout/tab/components/TabList';
import { useTabList } from '@/ui/layout/tab/hooks/useTabList';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';

const StyledShowPageRightContainer = styled.div<{ isMobile: boolean }>`
  display: flex;
  flex: 1 0 0;
  flex-direction: column;
  justify-content: start;
  width: 100%;
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

  const targetObjectNameSingular =
    targetableObject.targetObjectNameSingular as CoreObjectNameSingular;

  const isCompanyOrPerson = [
    CoreObjectNameSingular.Company,
    CoreObjectNameSingular.Person,
  ].includes(targetObjectNameSingular);

  const shouldDisplayCalendarTab = isCompanyOrPerson;
  const shouldDisplayEmailsTab = emails && isCompanyOrPerson;

  const isMobile = useIsMobile() || isRightDrawer;

  const tabs = [
    {
      id: 'summary',
      title: 'Summary',
      Icon: IconHome,
      hide: !isMobile,
    },
    {
      id: 'timeline',
      title: 'Timeline',
      Icon: IconTimelineEvent,
      hide: !timeline || isRightDrawer,
    },
    { id: 'tasks', title: 'Tasks', Icon: IconCheckbox, hide: !tasks },
    { id: 'notes', title: 'Notes', Icon: IconNotes, hide: !notes },
    { id: 'files', title: 'Files', Icon: IconPaperclip, hide: !notes },
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
  ];

  const renderActiveTabContent = () => {
    switch (activeTabId) {
      case 'timeline':
        return (
          <>
            <TimelineActivitiesQueryEffect
              targetableObject={targetableObject}
            />
            <TimelineActivities targetableObject={targetableObject} />
          </>
        );
      case 'summary':
        return summary;
      case 'tasks':
        return <ObjectTasks targetableObject={targetableObject} />;
      case 'notes':
        return <Notes targetableObject={targetableObject} />;
      case 'files':
        return <Attachments targetableObject={targetableObject} />;
      case 'emails':
        return <EmailThreads targetableObject={targetableObject} />;
      case 'calendar':
        return <Calendar targetableObject={targetableObject} />;
      default:
        return <></>;
    }
  };

  return (
    <StyledShowPageRightContainer isMobile={isMobile}>
      <StyledTabListContainer>
        <TabList
          loading={loading}
          tabListId={TAB_LIST_COMPONENT_ID + isRightDrawer}
          tabs={tabs}
        />
      </StyledTabListContainer>
      {renderActiveTabContent()}
    </StyledShowPageRightContainer>
  );
};
