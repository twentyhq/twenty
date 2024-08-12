import styled from '@emotion/styled';
import { useRecoilValue } from 'recoil';
import {
  IconCalendarEvent,
  IconCheckbox,
  IconList,
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
import { ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { ShowPageActivityContainer } from '@/ui/layout/show-page/components/ShowPageActivityContainer';
import { TabList } from '@/ui/layout/tab/components/TabList';
import { useTabList } from '@/ui/layout/tab/hooks/useTabList';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';

const StyledShowPageRightContainer = styled.div<{ isMobile: boolean }>`
  display: flex;
  flex: 1 0 0;
  flex-direction: column;
  justify-content: start;
  width: 100%;
  height: 100%;
`;

const StyledTabListContainer = styled.div`
  align-items: center;
  border-bottom: ${({ theme }) => `1px solid ${theme.border.color.light}`};
  box-sizing: border-box;
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  height: 40px;
`;

const StyledGreyBox = styled.div<{ isInRightDrawer: boolean }>`
  background: ${({ theme, isInRightDrawer }) =>
    isInRightDrawer ? theme.background.secondary : ''};
  border: ${({ isInRightDrawer, theme }) =>
    isInRightDrawer ? `1px solid ${theme.border.color.medium}` : ''};
  border-radius: ${({ isInRightDrawer, theme }) =>
    isInRightDrawer ? theme.border.radius.md : ''};
  height: ${({ isInRightDrawer }) => (isInRightDrawer ? 'auto' : '100%')};

  margin: ${({ isInRightDrawer, theme }) =>
    isInRightDrawer ? theme.spacing(4) : ''};
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
  fieldsBox?: JSX.Element;
  summaryCard?: JSX.Element;
  isInRightDrawer?: boolean;
  loading: boolean;
};

export const ShowPageRightContainer = ({
  targetableObject,
  timeline,
  tasks,
  notes,
  emails,
  loading,
  fieldsBox,
  summaryCard,
  isInRightDrawer = false,
}: ShowPageRightContainerProps) => {
  const { activeTabIdState } = useTabList(
    `${TAB_LIST_COMPONENT_ID}-${isInRightDrawer}`,
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

  const isMobile = useIsMobile() || isInRightDrawer;

  const tabs = [
    {
      id: 'richText',
      title: 'Note',
      Icon: IconNotes,
      hide:
        loading ||
        (targetableObject.targetObjectNameSingular !==
          CoreObjectNameSingular.Note &&
          targetableObject.targetObjectNameSingular !==
            CoreObjectNameSingular.Task),
    },
    {
      id: 'fields',
      title: 'Fields',
      Icon: IconList,
      hide: !isMobile,
    },
    {
      id: 'timeline',
      title: 'Timeline',
      Icon: IconTimelineEvent,
      hide: !timeline || isInRightDrawer,
    },
    {
      id: 'tasks',
      title: 'Tasks',
      Icon: IconCheckbox,
      hide:
        !tasks ||
        targetableObject.targetObjectNameSingular ===
          CoreObjectNameSingular.Note ||
        targetableObject.targetObjectNameSingular ===
          CoreObjectNameSingular.Task,
    },
    {
      id: 'notes',
      title: 'Notes',
      Icon: IconNotes,
      hide:
        !notes ||
        targetableObject.targetObjectNameSingular ===
          CoreObjectNameSingular.Note ||
        targetableObject.targetObjectNameSingular ===
          CoreObjectNameSingular.Task,
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
  ];
  const renderActiveTabContent = () => {
    switch (activeTabId) {
      case 'timeline':
        return (
          <>
            <TimelineActivities
              targetableObject={targetableObject}
              isInRightDrawer={isInRightDrawer}
            />
          </>
        );
      case 'richText':
        return (
          (targetableObject.targetObjectNameSingular ===
            CoreObjectNameSingular.Note ||
            targetableObject.targetObjectNameSingular ===
              CoreObjectNameSingular.Task) && (
            <ShowPageActivityContainer targetableObject={targetableObject} />
          )
        );
      case 'fields':
        return (
          <StyledGreyBox isInRightDrawer={isInRightDrawer}>
            {fieldsBox}
          </StyledGreyBox>
        );

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
          tabListId={`${TAB_LIST_COMPONENT_ID}-${isInRightDrawer}`}
          tabs={tabs}
        />
      </StyledTabListContainer>
      {summaryCard}
      {renderActiveTabContent()}
    </StyledShowPageRightContainer>
  );
};
