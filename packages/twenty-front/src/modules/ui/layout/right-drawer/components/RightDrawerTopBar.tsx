import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useRecoilState, useRecoilValue } from 'recoil';
import { Chip, ChipAccent, ChipSize, useIcons } from 'twenty-ui';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { getBasePathToShowPage } from '@/object-metadata/utils/getBasePathToShowPage';
import { isNewViewableRecordLoadingState } from '@/object-record/record-right-drawer/states/isNewViewableRecordLoading';
import { viewableRecordIdState } from '@/object-record/record-right-drawer/states/viewableRecordIdState';
import { viewableRecordNameSingularState } from '@/object-record/record-right-drawer/states/viewableRecordNameSingularState';
import { RightDrawerTopBarCloseButton } from '@/ui/layout/right-drawer/components/RightDrawerTopBarCloseButton';
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

  const isNewViewableRecordLoading = useRecoilValue(
    isNewViewableRecordLoadingState,
  );

  const viewableRecordId = useRecoilValue(viewableRecordIdState);

  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular: viewableRecordNameSingular ?? 'company',
  });

  if (!rightDrawerPage) {
    return null;
  }

  const PageIcon = getIcon(RIGHT_DRAWER_PAGE_ICONS[rightDrawerPage]);

  const ObjectIcon = getIcon(objectMetadataItem.icon);

  const isViewRecordRightDrawerPage =
    rightDrawerPage === RightDrawerPages.ViewRecord;

  const label = isViewRecordRightDrawerPage
    ? objectMetadataItem.labelSingular
    : RIGHT_DRAWER_PAGE_TITLES[rightDrawerPage];

  const Icon = isViewRecordRightDrawerPage ? ObjectIcon : PageIcon;

  return (
    <StyledRightDrawerTopBar
      onClick={handleOnclick}
      isRightDrawerMinimized={isRightDrawerMinimized}
    >
      {!isRightDrawerMinimized && (
        <Chip
          disabled={isNewViewableRecordLoading}
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
        {!isMobile && !isRightDrawerMinimized && (
          <RightDrawerTopBarMinimizeButton />
        )}

        {!isMobile &&
          !isRightDrawerMinimized &&
          isViewRecordRightDrawerPage && (
            <RightDrawerTopBarExpandButton
              to={
                getBasePathToShowPage({
                  objectNameSingular: viewableRecordNameSingular ?? '',
                }) + viewableRecordId
              }
            />
          )}

        <RightDrawerTopBarCloseButton />
      </StyledTopBarWrapper>
    </StyledRightDrawerTopBar>
  );
};
