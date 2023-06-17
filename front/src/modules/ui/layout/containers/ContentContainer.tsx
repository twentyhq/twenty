import styled from '@emotion/styled';
import { useRecoilState } from 'recoil';

import { Panel } from '../Panel';
import { RightDrawer } from '../right-drawer/components/RightDrawer';
import { isRightDrawerOpenState } from '../right-drawer/states/isRightDrawerOpenState';

type OwnProps = {
  children: JSX.Element;
  topMargin?: number;
};

const MainContainer = styled.div<{ topMargin: number }>`
  background: ${(props) => props.theme.noisyBackground};
  display: flex;

  flex-direction: row;
  gap: ${(props) => props.theme.spacing(2)};
  height: calc(100% - ${(props) => props.topMargin}px);

  padding-bottom: ${(props) => props.theme.spacing(3)};
  padding-right: ${(props) => props.theme.spacing(3)};
  width: calc(100% - ${(props) => props.theme.spacing(3)});
`;

type LeftContainerProps = {
  isRightDrawerOpen?: boolean;
};

const LeftContainer = styled.div<LeftContainerProps>`
  display: flex;
  position: relative;
  width: calc(
    100% -
      ${(props) =>
        props.isRightDrawerOpen
          ? `${props.theme.rightDrawerWidth} - ${props.theme.spacing(2)}`
          : '0px'}
  );
`;

export function ContentContainer({ children, topMargin }: OwnProps) {
  const [isRightDrawerOpen] = useRecoilState(isRightDrawerOpenState);

  return (
    <MainContainer topMargin={topMargin ?? 0}>
      <LeftContainer isRightDrawerOpen={isRightDrawerOpen}>
        <Panel>{children}</Panel>
      </LeftContainer>
      <RightDrawer />
    </MainContainer>
  );
}
