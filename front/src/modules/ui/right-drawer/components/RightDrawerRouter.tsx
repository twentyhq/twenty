import styled from '@emotion/styled';
import { useRecoilState } from 'recoil';

import { RightDrawerCreateActivity } from '@/activities/right-drawer/components/create/RightDrawerCreateActivity';
import { RightDrawerEditActivity } from '@/activities/right-drawer/components/edit/RightDrawerEditActivity';
import { RightDrawerTimeline } from '@/activities/right-drawer/components/RightDrawerTimeline';

import { rightDrawerPageState } from '../states/rightDrawerPageState';
import { RightDrawerPages } from '../types/RightDrawerPages';

import { RightDrawerTopBar } from './RightDrawerTopBar';

const RightDrawerPage = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
`;

const RightDrawerBody = styled.div`
  display: flex;
  flex-direction: column;
  height: calc(
    100vh - ${({ theme }) => theme.spacing(14)} - 1px
  ); // (-1 for border)
  overflow: auto;
  position: relative;
`;

export function RightDrawerRouter() {
  const [rightDrawerPage] = useRecoilState(rightDrawerPageState);

  let page = <></>;

  switch (rightDrawerPage) {
    case RightDrawerPages.Timeline:
      page = <RightDrawerTimeline />;
      break;
    case RightDrawerPages.CreateActivity:
      page = <RightDrawerCreateActivity />;
      break;
    case RightDrawerPages.EditActivity:
      page = <RightDrawerEditActivity />;
      break;
    default:
      break;
  }

  return (
    <RightDrawerPage>
      <RightDrawerTopBar />
      <RightDrawerBody>{page}</RightDrawerBody>
    </RightDrawerPage>
  );
}
