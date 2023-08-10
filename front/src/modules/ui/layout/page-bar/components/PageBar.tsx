import { ReactNode, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from '@emotion/styled';
import { useRecoilValue } from 'recoil';

import { IconButton } from '@/ui/button/components/IconButton';
import { IconChevronLeft, IconHeart, IconPlus } from '@/ui/icon/index';
import NavCollapseButton from '@/ui/navbar/components/NavCollapseButton';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';

import { navbarIconSize } from '../../../navbar/constants';
import { OverflowingTextWithTooltip } from '../../../tooltip/OverflowingTextWithTooltip';
import { isNavbarOpenedState } from '../../states/isNavbarOpenedState';

export const PAGE_BAR_MIN_HEIGHT = 40;

const TopBarContainer = styled.div`
  align-items: center;
  background: ${({ theme }) => theme.background.noisy};
  color: ${({ theme }) => theme.font.color.primary};
  display: flex;
  flex-direction: row;
  font-size: ${({ theme }) => theme.font.size.lg};
  justify-content: space-between;
  min-height: ${PAGE_BAR_MIN_HEIGHT}px;
  padding: ${({ theme }) => theme.spacing(2)};
  padding-left: 0;
  padding-right: ${({ theme }) => theme.spacing(3)};
`;

const StyledLeftContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: row;
  width: 100%;
`;

const TitleContainer = styled.div`
  display: flex;
  font-size: ${({ theme }) => theme.font.size.md};
  margin-left: ${({ theme }) => theme.spacing(1)};
  max-width: 50%;
`;

const TopBarButtonContainer = styled.div`
  margin-right: ${({ theme }) => theme.spacing(1)};
`;

const BackIconButton = styled(IconButton)`
  margin-right: ${({ theme }) => theme.spacing(1)};
`;

const StyledTopBarIconTitleContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: row;
  padding-left: ${({ theme }) => theme.spacing(2)};
  width: 100%;
`;

const ActionButtonsContainer = styled.div`
  display: inline-flex;
  gap: ${({ theme }) => theme.spacing(2)};
`;

type OwnProps = {
  title: string;
  hasBackButton?: boolean;
  isFavorite?: boolean;
  icon: ReactNode;
  onAddButtonClick?: () => void;
  onFavouriteButtonClick?: () => void;
};

export function PageBar({
  title,
  hasBackButton,
  isFavorite,
  icon,
  onAddButtonClick,
  onFavouriteButtonClick,
}: OwnProps) {
  const navigate = useNavigate();
  const navigateBack = useCallback(() => navigate(-1), [navigate]);

  const isNavbarOpened = useRecoilValue(isNavbarOpenedState);

  const iconSize = useIsMobile()
    ? navbarIconSize.mobile
    : navbarIconSize.desktop;

  return (
    <>
      <TopBarContainer>
        <StyledLeftContainer>
          {!isNavbarOpened && (
            <TopBarButtonContainer>
              <NavCollapseButton direction="right" />
            </TopBarButtonContainer>
          )}
          {hasBackButton && (
            <TopBarButtonContainer>
              <BackIconButton
                icon={<IconChevronLeft size={iconSize} />}
                onClick={navigateBack}
              />
            </TopBarButtonContainer>
          )}
          <StyledTopBarIconTitleContainer>
            {icon}
            <TitleContainer data-testid="top-bar-title">
              <OverflowingTextWithTooltip text={title} />
            </TitleContainer>
          </StyledTopBarIconTitleContainer>
        </StyledLeftContainer>
        <ActionButtonsContainer>
          {onFavouriteButtonClick && (
            <IconButton
              icon={<IconHeart size={16} />}
              size="large"
              data-testid="add-button"
              accent={isFavorite ? 'red' : 'regular'}
              onClick={onFavouriteButtonClick}
              variant="border"
            />
          )}
          {onAddButtonClick && (
            <IconButton
              icon={<IconPlus size={16} />}
              size="large"
              data-testid="add-button"
              textColor="secondary"
              onClick={onAddButtonClick}
              variant="border"
            />
          )}
        </ActionButtonsContainer>
      </TopBarContainer>
    </>
  );
}
