import { ReactNode, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from '@emotion/styled';
import { useRecoilValue } from 'recoil';

import { IconButton } from '@/ui/button/components/IconButton';
import { LightIconButton } from '@/ui/button/components/LightIconButton';
import { DropdownRecoilScopeContext } from '@/ui/dropdown/states/recoil-scope-contexts/DropdownRecoilScopeContext';
import { IconChevronLeft, IconHeart, IconPlus } from '@/ui/icon/index';
import NavCollapseButton from '@/ui/navbar/components/NavCollapseButton';
import { RecoilScope } from '@/ui/utilities/recoil-scope/components/RecoilScope';

import { OverflowingTextWithTooltip } from '../../../tooltip/OverflowingTextWithTooltip';
import { isNavbarOpenedState } from '../../states/isNavbarOpenedState';

export const PAGE_BAR_MIN_HEIGHT = 40;

const StyledTopBarContainer = styled.div`
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

const StyledTitleContainer = styled.div`
  display: flex;
  font-size: ${({ theme }) => theme.font.size.md};
  margin-left: ${({ theme }) => theme.spacing(1)};
  max-width: 50%;
`;

const StyledTopBarButtonContainer = styled.div`
  margin-right: ${({ theme }) => theme.spacing(1)};
`;

const StyledTopBarIconTitleContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: row;
  padding-left: ${({ theme }) => theme.spacing(2)};
  width: 100%;
`;

const StyledActionButtonsContainer = styled.div`
  display: inline-flex;
  gap: ${({ theme }) => theme.spacing(2)};
`;

type OwnProps = {
  title: string;
  hasBackButton?: boolean;
  isFavorite?: boolean;
  icon: ReactNode;
  onAddButtonClick?: () => void;
  onFavoriteButtonClick?: () => void;
  extraButtons?: ReactNode[];
};

export function PageBar({
  title,
  hasBackButton,
  isFavorite,
  icon,
  onAddButtonClick,
  onFavoriteButtonClick,
  extraButtons,
}: OwnProps) {
  const navigate = useNavigate();
  const navigateBack = useCallback(() => navigate(-1), [navigate]);

  const isNavbarOpened = useRecoilValue(isNavbarOpenedState);

  return (
    <>
      <StyledTopBarContainer>
        <StyledLeftContainer>
          {!isNavbarOpened && (
            <StyledTopBarButtonContainer>
              <NavCollapseButton direction="right" hide={true} />
            </StyledTopBarButtonContainer>
          )}
          {hasBackButton && (
            <StyledTopBarButtonContainer>
              <LightIconButton
                size="medium"
                accent="tertiary"
                icon={<IconChevronLeft />}
                onClick={navigateBack}
              />
            </StyledTopBarButtonContainer>
          )}
          <StyledTopBarIconTitleContainer>
            {icon}
            <StyledTitleContainer data-testid="top-bar-title">
              <OverflowingTextWithTooltip text={title} />
            </StyledTitleContainer>
          </StyledTopBarIconTitleContainer>
        </StyledLeftContainer>

        <RecoilScope SpecificContext={DropdownRecoilScopeContext}>
          <StyledActionButtonsContainer>
            {onFavoriteButtonClick && (
              <IconButton
                icon={<IconHeart size={16} />}
                size="medium"
                variant="secondary"
                data-testid="add-button"
                accent={isFavorite ? 'danger' : 'default'}
                onClick={onFavoriteButtonClick}
              />
            )}
            {onAddButtonClick && (
              <IconButton
                icon={<IconPlus size={16} />}
                size="medium"
                variant="secondary"
                data-testid="add-button"
                accent="default"
                onClick={onAddButtonClick}
              />
            )}
            {extraButtons}
          </StyledActionButtonsContainer>
        </RecoilScope>
      </StyledTopBarContainer>
    </>
  );
}
