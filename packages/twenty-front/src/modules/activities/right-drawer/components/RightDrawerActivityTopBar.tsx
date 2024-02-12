import styled from '@emotion/styled';

import { ActivityActionBar } from '@/activities/right-drawer/components/ActivityActionBar';
import { StyledRightDrawerTopBar } from '@/ui/layout/right-drawer/components/StyledRightDrawerTopBar';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';

import { RightDrawerTopBarCloseButton } from '../../../ui/layout/right-drawer/components/RightDrawerTopBarCloseButton';
import { RightDrawerTopBarExpandButton } from '../../../ui/layout/right-drawer/components/RightDrawerTopBarExpandButton';

const StyledTopBarWrapper = styled.div`
  display: flex;
`;

export const RightDrawerActivityTopBar = () => {
  const isMobile = useIsMobile();

  return (
    <StyledRightDrawerTopBar>
      <StyledTopBarWrapper>
        <RightDrawerTopBarCloseButton />
        {!isMobile && <RightDrawerTopBarExpandButton />}
      </StyledTopBarWrapper>
      <ActivityActionBar />
    </StyledRightDrawerTopBar>
  );
};
