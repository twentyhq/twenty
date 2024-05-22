import styled from '@emotion/styled';

import { ActivityActionBar } from '@/activities/right-drawer/components/ActivityActionBar';
import { MessageThreadMembersBar } from '@/activities/right-drawer/components/MessageThreadMembersBar';
import { RightDrawerTopBarCloseButton } from '@/ui/layout/right-drawer/components/RightDrawerTopBarCloseButton';
import { RightDrawerTopBarExpandButton } from '@/ui/layout/right-drawer/components/RightDrawerTopBarExpandButton';
import { StyledRightDrawerTopBar } from '@/ui/layout/right-drawer/components/StyledRightDrawerTopBar';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';

type RightDrawerActivityTopBarProps = {
  showActionBar?: boolean;
  showMembersBar?: boolean;
};

const StyledTopBarWrapper = styled.div`
  display: flex;
`;

export const RightDrawerActivityTopBar = ({
  showActionBar = true,
  showMembersBar = false,
}: RightDrawerActivityTopBarProps) => {
  const isMobile = useIsMobile();

  return (
    <StyledRightDrawerTopBar>
      <StyledTopBarWrapper>
        <RightDrawerTopBarCloseButton />
        {!isMobile && <RightDrawerTopBarExpandButton />}
      </StyledTopBarWrapper>
      {showActionBar && <ActivityActionBar />}
      {showMembersBar && <MessageThreadMembersBar />}
    </StyledRightDrawerTopBar>
  );
};
