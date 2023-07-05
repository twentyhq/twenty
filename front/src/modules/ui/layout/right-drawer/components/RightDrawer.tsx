import { useEffect } from 'react';
import styled from '@emotion/styled';
import { useRecoilState } from 'recoil';

import { captureHotkeyTypeInFocusState } from '@/hotkeys/states/captureHotkeyTypeInFocusState';
import { isDefined } from '@/utils/type-guards/isDefined';

import { Panel } from '../../Panel';
import { isRightDrawerOpenState } from '../states/isRightDrawerOpenState';
import { rightDrawerPageState } from '../states/rightDrawerPageState';

import { RightDrawerRouter } from './RightDrawerRouter';

const StyledRightDrawer = styled.div`
  display: flex;
  flex-direction: row;
  width: ${({ theme }) => theme.rightDrawerWidth};
`;

export function RightDrawer() {
  const [, setCaptureHotkeyTypeInFocus] = useRecoilState(
    captureHotkeyTypeInFocusState,
  );
  const [isRightDrawerOpen] = useRecoilState(isRightDrawerOpenState);
  const [rightDrawerPage] = useRecoilState(rightDrawerPageState);
  useEffect(() => {
    setCaptureHotkeyTypeInFocus(isRightDrawerOpen);
  }, [isRightDrawerOpen, setCaptureHotkeyTypeInFocus]);
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
