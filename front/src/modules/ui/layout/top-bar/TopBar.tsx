import { ReactNode } from 'react';
import { TbPlus } from 'react-icons/tb';
import styled from '@emotion/styled';
import { useRecoilState } from 'recoil';

import { IconSidebarRightCollapse } from '@/ui/icons';

import NavCollapseButton from '../navbar/NavCollapseButton';
import { isNavbarOpenedState } from '../states/isNavbarOpenedState';

export const TOP_BAR_MIN_HEIGHT = '40px';

const TopBarContainer = styled.div`
  display: flex;
  flex-direction: row;
  min-height: ${TOP_BAR_MIN_HEIGHT};
  align-items: center;
  background: ${(props) => props.theme.noisyBackground};
  padding: ${(props) => props.theme.spacing(2)};
  font-size: 14px;
  color: ${(props) => props.theme.text80};
`;

const TitleContainer = styled.div`
  font-family: 'Inter';
  margin-left: 4px;
  font-size: 14px;
  display: flex;
  width: 100%;
`;

const AddButtonContainer = styled.div`
  display: flex;
  justify-self: flex-end;
  flex-shrink: 0;
  border: 1px solid ${(props) => props.theme.primaryBorder};
  width: 28px;
  height: 28px;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  color: ${(props) => props.theme.text80};
  cursor: pointer;
  user-select: none;
  margin-right: ${(props) => props.theme.spacing(1)};
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
          <AddButtonContainer
            data-testid="add-button"
            onClick={onAddButtonClick}
          >
            <TbPlus size={16} />
          </AddButtonContainer>
        )}
      </TopBarContainer>
    </>
  );
}
