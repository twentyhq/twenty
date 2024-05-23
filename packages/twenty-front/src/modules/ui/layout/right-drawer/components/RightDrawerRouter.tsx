import styled from '@emotion/styled';
import { useRecoilState, useRecoilValue } from 'recoil';

import { RightDrawerCalendarEvent } from '@/activities/calendar/right-drawer/components/RightDrawerCalendarEvent';
import { RightDrawerEmailThread } from '@/activities/emails/right-drawer/components/RightDrawerEmailThread';
import { RightDrawerCreateActivity } from '@/activities/right-drawer/components/create/RightDrawerCreateActivity';
import { RightDrawerEditActivity } from '@/activities/right-drawer/components/edit/RightDrawerEditActivity';
import { RightDrawerRecord } from '@/object-record/record-right-drawer/components/RightDrawerRecord';
import { RightDrawerGenericTopBar } from '@/ui/layout/right-drawer/components/RightDrawerGenericTopBar';
import { isRightDrawerMinimizedState } from '@/ui/layout/right-drawer/states/isRightDrawerMinimizedState';

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

const RIGHT_DRAWER_PAGES_CONFIG = {
  [RightDrawerPages.CreateActivity]: {
    page: <RightDrawerCreateActivity />,
    topBar: <RightDrawerGenericTopBar page={RightDrawerPages.CreateActivity} />,
  },
  [RightDrawerPages.EditActivity]: {
    page: <RightDrawerEditActivity />,
    topBar: <RightDrawerGenericTopBar page={RightDrawerPages.EditActivity} />,
  },
  [RightDrawerPages.ViewEmailThread]: {
    page: <RightDrawerEmailThread />,
    topBar: (
      <RightDrawerGenericTopBar page={RightDrawerPages.ViewEmailThread} />
    ),
  },
  [RightDrawerPages.ViewCalendarEvent]: {
    page: <RightDrawerCalendarEvent />,
    topBar: (
      <RightDrawerGenericTopBar page={RightDrawerPages.ViewCalendarEvent} />
    ),
  },
  [RightDrawerPages.ViewRecord]: {
    page: <RightDrawerRecord />,
    topBar: <RightDrawerGenericTopBar page={RightDrawerPages.ViewRecord} />,
  },
};

export const RightDrawerRouter = () => {
  const [rightDrawerPage] = useRecoilState(rightDrawerPageState);

  const { topBar = null, page = null } = rightDrawerPage
    ? RIGHT_DRAWER_PAGES_CONFIG[rightDrawerPage]
    : {};

  const isRightDrawerMinimized = useRecoilValue(isRightDrawerMinimizedState);

  return (
    <StyledRightDrawerPage>
      {topBar}
      {!isRightDrawerMinimized && (
        <StyledRightDrawerBody>{page}</StyledRightDrawerBody>
      )}
    </StyledRightDrawerPage>
  );
};
