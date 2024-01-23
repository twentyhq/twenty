import styled from '@emotion/styled';
import { useRecoilState } from 'recoil';

import { RightDrawerThread } from '@/activities/emails/right-drawer/components/RightDrawerThread';
import { RightDrawerThreadTopBar } from '@/activities/emails/right-drawer/components/RightDrawerThreadTopBar';
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

export const RightDrawerRouter = () => {
  const [rightDrawerPage] = useRecoilState(rightDrawerPageState);

  let page = <></>;
  let topBar = <></>;

  switch (rightDrawerPage) {
    case RightDrawerPages.CreateActivity:
      page = <RightDrawerCreateActivity />;
      topBar = <RightDrawerActivityTopBar />;
      break;
    case RightDrawerPages.EditActivity:
      page = <RightDrawerEditActivity />;
      topBar = <RightDrawerActivityTopBar />;
      break;
    case RightDrawerPages.ViewThread:
      page = <RightDrawerThread />;
      topBar = <RightDrawerThreadTopBar />;
      break;
    default:
      break;
  }

  return (
    <StyledRightDrawerPage>
      {topBar}
      <StyledRightDrawerBody>{page}</StyledRightDrawerBody>
    </StyledRightDrawerPage>
  );
};
