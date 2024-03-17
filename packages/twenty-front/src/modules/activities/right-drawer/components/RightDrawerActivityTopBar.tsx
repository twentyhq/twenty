import styled from '@emotion/styled';
import { useIsMobile } from 'twenty-ui';

import { ActivityActionBar } from '@/activities/right-drawer/components/ActivityActionBar';
import { RightDrawerTopBarCloseButton } from '@/ui/layout/right-drawer/components/RightDrawerTopBarCloseButton';
import { RightDrawerTopBarExpandButton } from '@/ui/layout/right-drawer/components/RightDrawerTopBarExpandButton';
import { StyledRightDrawerTopBar } from '@/ui/layout/right-drawer/components/StyledRightDrawerTopBar';

type RightDrawerActivityTopBarProps = { showActionBar?: boolean };

const StyledTopBarWrapper = styled.div`
  display: flex;
`;

export const RightDrawerActivityTopBar = ({
  showActionBar = true,
}: RightDrawerActivityTopBarProps) => {
  const isMobile = useIsMobile();

  return (
    <StyledRightDrawerTopBar>
      <StyledTopBarWrapper>
        <RightDrawerTopBarCloseButton />
        {!isMobile && <RightDrawerTopBarExpandButton />}
      </StyledTopBarWrapper>
      {showActionBar && <ActivityActionBar />}
    </StyledRightDrawerTopBar>
  );
};
