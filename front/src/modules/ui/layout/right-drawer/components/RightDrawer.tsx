import styled from '@emotion/styled';
import { useRecoilState } from 'recoil';

import { isDefined } from '@/utils/type-guards/isDefined';

import { Panel } from '../../Panel';
import { isRightDrawerOpenState } from '../states/isRightDrawerOpenState';
import { rightDrawerPageState } from '../states/rightDrawerPageState';

import { RightDrawerRouter } from './RightDrawerRouter';

const StyledRightDrawer = styled.div`
  display: flex;
  flex-direction: row;
  width: 300px;
  margin-left: ${(props) => props.theme.spacing(2)};
`;

export function RightDrawer() {
  const [isRightDrawerOpen] = useRecoilState(isRightDrawerOpenState);
  const [rightDrawerPage] = useRecoilState(rightDrawerPageState);

  if (!isRightDrawerOpen || !isDefined(rightDrawerPage)) {
    return <></>;
  }

  return (
    <StyledRightDrawer>
      <Panel>
        <RightDrawerRouter />
      </Panel>
    </StyledRightDrawer>
  );
}
