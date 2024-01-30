import styled from '@emotion/styled';
import { useSetRecoilState } from 'recoil';
import { Button, ButtonGroup } from 'tsup.ui.index';

import { useOpenCreateActivityDrawer } from '@/activities/hooks/useOpenCreateActivityDrawer';
import { useTimelineActivities } from '@/activities/timeline/hooks/useTimelineActivities';
import { ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import {
  IconCheckbox,
  IconNotes,
  IconPaperclip,
} from '@/ui/display/icon/index';
import AnimatedPlaceholder from '@/ui/layout/animated-placeholder/components/AnimatedPlaceholder';
import {
  StyledEmptyContainer,
  StyledEmptySubTitle,
  StyledEmptyTextContainer,
  StyledEmptyTitle,
} from '@/ui/layout/animated-placeholder/components/EmptyPlaceholderStyled';
import { TAB_LIST_COMPONENT_ID } from '@/ui/layout/show-page/components/ShowPageRightContainer';
import { useTabList } from '@/ui/layout/tab/hooks/useTabList';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';

import { TimelineItemsContainer } from './TimelineItemsContainer';

const StyledMainContainer = styled.div`
  align-items: flex-start;
  align-self: stretch;
  border-top: ${({ theme }) =>
    useIsMobile() ? `1px solid ${theme.border.color.medium}` : 'none'};
  display: flex;
  flex-direction: column;
  height: 100%;

  justify-content: center;
`;

export const Timeline = ({
  targetableObject,
}: {
  targetableObject: ActivityTargetableObject;
}) => {
  const { getActiveTabIdState } = useTabList(TAB_LIST_COMPONENT_ID);
  const setActiveTabId = useSetRecoilState(getActiveTabIdState());

  const { activities, initialized } = useTimelineActivities({
    targetableObject,
  });

  const openCreateActivity = useOpenCreateActivityDrawer();

  const showEmptyState = initialized && activities.length === 0;

  const showLoadingState = !initialized;

  if (showLoadingState) {
    // TODO: Display a beautiful loading page
    return <></>;
  }

  if (showEmptyState) {
    return (
      <StyledEmptyContainer>
        <AnimatedPlaceholder type="emptyTimeline" />
        <StyledEmptyTextContainer>
          <StyledEmptyTitle>Add your first Activity</StyledEmptyTitle>
          <StyledEmptySubTitle>
            There are no activities associated with this record.{' '}
          </StyledEmptySubTitle>
        </StyledEmptyTextContainer>
        <ButtonGroup variant={'secondary'}>
          <Button
            Icon={IconNotes}
            title="Note"
            onClick={() =>
              openCreateActivity({
                type: 'Note',
                targetableObjects: [targetableObject],
              })
            }
          />
          <Button
            Icon={IconCheckbox}
            title="Task"
            onClick={() =>
              openCreateActivity({
                type: 'Task',
                targetableObjects: [targetableObject],
              })
            }
          />
          <Button
            Icon={IconPaperclip}
            title="File"
            onClick={() => setActiveTabId('files')}
          />
        </ButtonGroup>
      </StyledEmptyContainer>
    );
  }

  return (
    <StyledMainContainer>
      <TimelineItemsContainer activities={activities} />
    </StyledMainContainer>
  );
};
