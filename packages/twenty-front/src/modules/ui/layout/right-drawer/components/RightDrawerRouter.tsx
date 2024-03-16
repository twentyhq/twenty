import styled from '@emotion/styled';
import { useRecoilState } from 'recoil';

import { RightDrawerCalendarEvent } from '@/activities/calendar/right-drawer/components/RightDrawerCalendarEvent';
import { RightDrawerEmailThread } from '@/activities/emails/right-drawer/components/RightDrawerEmailThread';
import { RightDrawerCreateActivity } from '@/activities/right-drawer/components/create/RightDrawerCreateActivity';
import { RightDrawerEditActivity } from '@/activities/right-drawer/components/edit/RightDrawerEditActivity';

import { RightDrawerActivityTopBar } from '../../../../activities/right-drawer/components/RightDrawerActivityTopBar';
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
  overflow: auto;
  position: relative;
`;

const RIGHT_DRAWER_PAGES_CONFIG = {
  [RightDrawerPages.CreateActivity]: {
    page: <RightDrawerCreateActivity />,
    topBar: <RightDrawerActivityTopBar />,
  },
  [RightDrawerPages.EditActivity]: {
    page: <RightDrawerEditActivity />,
    topBar: <RightDrawerActivityTopBar />,
  },
  [RightDrawerPages.ViewEmailThread]: {
    page: <RightDrawerEmailThread />,
    topBar: <RightDrawerActivityTopBar showActionBar={false} />,
  },
  [RightDrawerPages.ViewCalendarEvent]: {
    page: <RightDrawerCalendarEvent />,
    topBar: <RightDrawerActivityTopBar showActionBar={false} />,
  },
};

export const RightDrawerRouter = () => {
  const [rightDrawerPage] = useRecoilState(rightDrawerPageState());

  const { topBar = null, page = null } = rightDrawerPage
    ? RIGHT_DRAWER_PAGES_CONFIG[rightDrawerPage]
    : {};

  return (
    <StyledRightDrawerPage>
      {topBar}
      <StyledRightDrawerBody>{page}</StyledRightDrawerBody>
    </StyledRightDrawerPage>
  );
};
