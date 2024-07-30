import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useRecoilState, useRecoilValue } from 'recoil';
import { Chip, ChipAccent, ChipSize, useIcons } from 'twenty-ui';

import { ActivityActionBar } from '@/activities/right-drawer/components/ActivityActionBar';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { viewableRecordNameSingularState } from '@/object-record/record-right-drawer/states/viewableRecordNameSingularState';
import { RightDrawerTopBarCloseButton } from '@/ui/layout/right-drawer/components/RightDrawerTopBarCloseButton';
import { RightDrawerTopBarDropdownButton } from '@/ui/layout/right-drawer/components/RightDrawerTopBarDropdownButton';
import { RightDrawerTopBarExpandButton } from '@/ui/layout/right-drawer/components/RightDrawerTopBarExpandButton';
import { RightDrawerTopBarMinimizeButton } from '@/ui/layout/right-drawer/components/RightDrawerTopBarMinimizeButton';
import { StyledRightDrawerTopBar } from '@/ui/layout/right-drawer/components/StyledRightDrawerTopBar';
import { RIGHT_DRAWER_PAGE_ICONS } from '@/ui/layout/right-drawer/constants/RightDrawerPageIcons';
import { RIGHT_DRAWER_PAGE_TITLES } from '@/ui/layout/right-drawer/constants/RightDrawerPageTitles';
import { isRightDrawerMinimizedState } from '@/ui/layout/right-drawer/states/isRightDrawerMinimizedState';
import { rightDrawerPageState } from '@/ui/layout/right-drawer/states/rightDrawerPageState';
import { RightDrawerPages } from '@/ui/layout/right-drawer/types/RightDrawerPages';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';

const StyledTopBarWrapper = styled.div`
  align-items: center;
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

export const RightDrawerTopBar = () => {
  const isMobile = useIsMobile();

  const rightDrawerPage = useRecoilValue(rightDrawerPageState);

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

  const viewableRecordNameSingular = useRecoilValue(
    viewableRecordNameSingularState,
  );

  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular: viewableRecordNameSingular ?? 'company',
  });

  if (!rightDrawerPage) {
    return null;
  }

  const PageIcon = getIcon(RIGHT_DRAWER_PAGE_ICONS[rightDrawerPage]);

  const ObjectIcon = getIcon(objectMetadataItem.icon);

  const label =
    rightDrawerPage === RightDrawerPages.ViewRecord
      ? objectMetadataItem.labelSingular
      : RIGHT_DRAWER_PAGE_TITLES[rightDrawerPage];

  const Icon =
    rightDrawerPage === RightDrawerPages.ViewRecord ? ObjectIcon : PageIcon;

  return (
    <StyledRightDrawerTopBar
      onClick={handleOnclick}
      isRightDrawerMinimized={isRightDrawerMinimized}
    >
      {!isRightDrawerMinimized &&
        (rightDrawerPage === RightDrawerPages.EditActivity ||
          rightDrawerPage === RightDrawerPages.CreateActivity) && (
          <ActivityActionBar />
        )}
      {!isRightDrawerMinimized &&
        rightDrawerPage !== RightDrawerPages.EditActivity &&
        rightDrawerPage !== RightDrawerPages.CreateActivity && (
          <Chip
            label={label}
            leftComponent={<Icon size={theme.icon.size.md} />}
            size={ChipSize.Large}
            accent={ChipAccent.TextSecondary}
            clickable={false}
          />
        )}
      {isRightDrawerMinimized && (
        <StyledMinimizeTopBarTitleContainer>
          <StyledMinimizeTopBarIcon>
            <Icon size={theme.icon.size.md} />
          </StyledMinimizeTopBarIcon>
          <StyledMinimizeTopBarTitle>{label}</StyledMinimizeTopBarTitle>
        </StyledMinimizeTopBarTitleContainer>
      )}
      <StyledTopBarWrapper>
        <RightDrawerTopBarDropdownButton />
        {!isMobile && !isRightDrawerMinimized && (
          <RightDrawerTopBarMinimizeButton />
        )}
        {!isMobile && !isRightDrawerMinimized && (
          <RightDrawerTopBarExpandButton />
        )}
        <RightDrawerTopBarCloseButton />
      </StyledTopBarWrapper>
    </StyledRightDrawerTopBar>
  );
};
