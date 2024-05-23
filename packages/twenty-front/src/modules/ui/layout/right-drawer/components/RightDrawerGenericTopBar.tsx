import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useRecoilState } from 'recoil';
import { Chip, ChipAccent, ChipSize, ChipVariant, useIcons } from 'twenty-ui';

import { RightDrawerTopBarCloseButton } from '@/ui/layout/right-drawer/components/RightDrawerTopBarCloseButton';
import { RightDrawerTopBarExpandButton } from '@/ui/layout/right-drawer/components/RightDrawerTopBarExpandButton';
import { RightDrawerTopBarMinimizeButton } from '@/ui/layout/right-drawer/components/RightDrawerTopBarMinimizeButton';
import { StyledRightDrawerTopBar } from '@/ui/layout/right-drawer/components/StyledRightDrawerTopBar';
import { RIGHT_DRAWER_PAGE_ICONS } from '@/ui/layout/right-drawer/constants/RightDrawerPageIcons';
import { RIGHT_DRAWER_PAGE_TITLES } from '@/ui/layout/right-drawer/constants/RightDrawerPageTitles';
import { isRightDrawerMinimizedState } from '@/ui/layout/right-drawer/states/isRightDrawerMinimizedState';
import { RightDrawerPages } from '@/ui/layout/right-drawer/types/RightDrawerPages';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';

const StyledTopBarWrapper = styled.div`
  display: flex;
`;

const StyledMinimizeTopBarTitleContainer = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
  height: 24px;
  width: 168px;
`;

const StyledMinimizeTopBarTitle = styled.div`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledMinimizeTopBarIcon = styled.div`
  align-items: center;
  display: flex;
`;

export const RightDrawerGenericTopBar = ({
  page,
}: {
  page: RightDrawerPages;
}) => {
  const isMobile = useIsMobile();

  const [isRightDrawerMinimized, setIsRightDrawerMinimized] = useRecoilState(
    isRightDrawerMinimizedState,
  );

  const theme = useTheme();

  const handleOnclick = () => {
    if (isRightDrawerMinimized) {
      setIsRightDrawerMinimized(false);
    }
  };

  const { getIcon } = useIcons();

  const PageIcon = getIcon(RIGHT_DRAWER_PAGE_ICONS[page]);

  return (
    <StyledRightDrawerTopBar
      onClick={handleOnclick}
      isRightDrawerMinimized={isRightDrawerMinimized}
    >
      {!isRightDrawerMinimized && (
        <Chip
          label={RIGHT_DRAWER_PAGE_TITLES[page]}
          leftComponent={<PageIcon size={theme.icon.size.md} />}
          size={ChipSize.Large}
          accent={ChipAccent.TextSecondary}
          variant={ChipVariant.Highlighted}
        />
      )}
      {isRightDrawerMinimized && (
        <StyledMinimizeTopBarTitleContainer>
          <StyledMinimizeTopBarIcon>
            <PageIcon size={theme.icon.size.md} />
          </StyledMinimizeTopBarIcon>
          <StyledMinimizeTopBarTitle>
            {RIGHT_DRAWER_PAGE_TITLES[page]}
          </StyledMinimizeTopBarTitle>
        </StyledMinimizeTopBarTitleContainer>
      )}
      <StyledTopBarWrapper>
        {!isRightDrawerMinimized && <RightDrawerTopBarMinimizeButton />}
        {!isMobile && !isRightDrawerMinimized && (
          <RightDrawerTopBarExpandButton />
        )}
        <RightDrawerTopBarCloseButton />
      </StyledTopBarWrapper>
    </StyledRightDrawerTopBar>
  );
};
