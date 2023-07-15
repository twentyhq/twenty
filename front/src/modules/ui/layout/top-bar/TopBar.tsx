import { ReactNode } from 'react';
import styled from '@emotion/styled';

import { IconButton } from '@/ui/components/buttons/IconButton';
import { IconPlus } from '@/ui/icons/index';

import NavCollapseButton from '../navbar/NavCollapseButton';

export const TOP_BAR_MIN_HEIGHT = 40;

const TopBarContainer = styled.div`
  align-items: center;
  background: ${({ theme }) => theme.background.noisy};
  color: ${({ theme }) => theme.font.color.primary};
  display: flex;
  flex-direction: row;
  font-size: 14px;
  min-height: ${TOP_BAR_MIN_HEIGHT}px;
  padding: ${({ theme }) => theme.spacing(2)};
  padding-right: ${({ theme }) => theme.spacing(3)};
`;

const TitleContainer = styled.div`
  display: flex;
  font-family: 'Inter';
  font-size: 14px;
  margin-left: 4px;
  width: 100%;
`;

type OwnProps = {
  title: string;
  icon: ReactNode;
  onAddButtonClick?: () => void;
};

export function TopBar({ title, icon, onAddButtonClick }: OwnProps) {
  return (
    <>
      <TopBarContainer>
        <NavCollapseButton hideIfOpen={true} />
        {icon}
        <TitleContainer data-testid="top-bar-title">{title}</TitleContainer>
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
