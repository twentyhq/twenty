import { ReactNode, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from '@emotion/styled';

import { IconButton } from '@/ui/button/components/IconButton';
import { IconChevronLeft, IconPlus } from '@/ui/icon/index';
import NavCollapseButton from '@/ui/navbar/components/NavCollapseButton';

import { OverflowingTextWithTooltip } from '../../../tooltip/OverflowingTextWithTooltip';

export const TOP_BAR_MIN_HEIGHT = 40;

const TopBarContainer = styled.div`
  align-items: center;
  background: ${({ theme }) => theme.background.noisy};
  color: ${({ theme }) => theme.font.color.primary};
  display: flex;
  flex-direction: row;
  font-size: ${({ theme }) => theme.font.size.lg};
  justify-content: space-between;
  min-height: ${TOP_BAR_MIN_HEIGHT}px;
  padding: ${({ theme }) => theme.spacing(2)};
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

const BackIconButton = styled(IconButton)`
  margin-right: ${({ theme }) => theme.spacing(1)};
`;

type OwnProps = {
  title: string;
  hasBackButton?: boolean;
  icon: ReactNode;
  onAddButtonClick?: () => void;
};

export function TopBar({
  title,
  hasBackButton,
  icon,
  onAddButtonClick,
}: OwnProps) {
  const navigate = useNavigate();
  const navigateBack = useCallback(() => navigate(-1), [navigate]);

  return (
    <>
      <TopBarContainer>
        <StyledLeftContainer>
          <NavCollapseButton hideIfOpen={true} />
          {hasBackButton && (
            <BackIconButton
              icon={<IconChevronLeft size={16} />}
              onClick={navigateBack}
            />
          )}
          {icon}
          <TitleContainer data-testid="top-bar-title">
            <OverflowingTextWithTooltip text={title} />
          </TitleContainer>
        </StyledLeftContainer>
        {onAddButtonClick && (
          <IconButton
            icon={<IconPlus size={16} />}
            size="large"
            data-testid="add-button"
            onClick={onAddButtonClick}
            variant="border"
          />
        )}
      </TopBarContainer>
    </>
  );
}
