import styled from '@emotion/styled';
import { useRecoilState } from 'recoil';
import { isRightDrawerOpenState } from '../../modules/ui/layout/right-drawer/states/isRightDrawerOpenState';
import { RightDrawerRouter } from './RightDrawerRouter';
import { rightDrawerPageState } from '../../modules/ui/layout/right-drawer/states/rightDrawerPageState';
import { isDefined } from '../../modules/utils/type-guards/isDefined';
import { Panel } from '../Panel';

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
