import styled from '@emotion/styled';
import {
  RightDrawerTopBar,
  RightDrawerTopBarCloseButton,
  RightDrawerTopBarExpandButton,
  useIsMobile,
} from 'twenty-ui';

import { ActivityActionBar } from '@/activities/right-drawer/components/ActivityActionBar';

type RightDrawerActivityTopBarProps = { showActionBar?: boolean };

const StyledTopBarWrapper = styled.div`
  display: flex;
`;

export const RightDrawerActivityTopBar = ({
  showActionBar = true,
}: RightDrawerActivityTopBarProps) => {
  const isMobile = useIsMobile();

  return (
    <RightDrawerTopBar>
      <StyledTopBarWrapper>
        <RightDrawerTopBarCloseButton />
        {!isMobile && <RightDrawerTopBarExpandButton />}
      </StyledTopBarWrapper>
      {showActionBar && <ActivityActionBar />}
    </RightDrawerTopBar>
  );
};
