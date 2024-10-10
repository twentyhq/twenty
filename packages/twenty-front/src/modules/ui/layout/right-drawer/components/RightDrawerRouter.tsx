import styled from '@emotion/styled';
import { useRecoilState, useRecoilValue } from 'recoil';

import { RightDrawerCalendarEvent } from '@/activities/calendar/right-drawer/components/RightDrawerCalendarEvent';
import { RightDrawerAIChat } from '@/activities/copilot/right-drawer/components/RightDrawerAIChat';
import { RightDrawerEmailThread } from '@/activities/emails/right-drawer/components/RightDrawerEmailThread';
import { RightDrawerRecord } from '@/object-record/record-right-drawer/components/RightDrawerRecord';
import { isRightDrawerMinimizedState } from '@/ui/layout/right-drawer/states/isRightDrawerMinimizedState';

import { RightDrawerTopBar } from '@/ui/layout/right-drawer/components/RightDrawerTopBar';
import { ComponentByRightDrawerPage } from '@/ui/layout/right-drawer/types/ComponentByRightDrawerPage';
import { RightDrawerWorkflowEditStep } from '@/workflow/components/RightDrawerWorkflowEditStep';
import { RightDrawerWorkflowSelectAction } from '@/workflow/components/RightDrawerWorkflowSelectAction';
import { RightDrawerWorkflowViewStep } from '@/workflow/components/RightDrawerWorkflowViewStep';
import { isDefined } from 'twenty-ui';
import { rightDrawerPageState } from '../states/rightDrawerPageState';
import { RightDrawerPages } from '../types/RightDrawerPages';

const StyledRightDrawerPage = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
`;

const StyledRightDrawerBody = styled.div`
  display: flex;
  flex-direction: column;
  height: calc(
    100vh - ${({ theme }) => theme.spacing(14)} - 1px
  ); // (-1 for border)
  //overflow: auto;
  position: relative;
`;

const RIGHT_DRAWER_PAGES_CONFIG: ComponentByRightDrawerPage = {
  [RightDrawerPages.ViewEmailThread]: <RightDrawerEmailThread />,
  [RightDrawerPages.ViewCalendarEvent]: <RightDrawerCalendarEvent />,
  [RightDrawerPages.ViewRecord]: <RightDrawerRecord />,
  [RightDrawerPages.Copilot]: <RightDrawerAIChat />,
  [RightDrawerPages.WorkflowStepSelectAction]: (
    <RightDrawerWorkflowSelectAction />
  ),
  [RightDrawerPages.WorkflowStepEdit]: <RightDrawerWorkflowEditStep />,
  [RightDrawerPages.WorkflowStepView]: <RightDrawerWorkflowViewStep />,
};

export const RightDrawerRouter = () => {
  const [rightDrawerPage] = useRecoilState(rightDrawerPageState);

  const rightDrawerPageComponent = isDefined(rightDrawerPage) ? (
    RIGHT_DRAWER_PAGES_CONFIG[rightDrawerPage]
  ) : (
    <></>
  );

  const isRightDrawerMinimized = useRecoilValue(isRightDrawerMinimizedState);

  return (
    <StyledRightDrawerPage>
      <RightDrawerTopBar />
      {!isRightDrawerMinimized && (
        <StyledRightDrawerBody>
          {rightDrawerPageComponent}
        </StyledRightDrawerBody>
      )}
    </StyledRightDrawerPage>
  );
};
