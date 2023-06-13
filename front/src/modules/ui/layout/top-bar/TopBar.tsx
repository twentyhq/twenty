import { ReactNode } from 'react';
import { TbPlus } from 'react-icons/tb';
import styled from '@emotion/styled';

import NavCollapseButton from '../navbar/NavCollapseButton';

export const TOP_BAR_MIN_HEIGHT = '40px';

const TopBarContainer = styled.div`
  align-items: center;
  background: ${(props) => props.theme.noisyBackground};
  color: ${(props) => props.theme.text80};
  display: flex;
  flex-direction: row;
  font-size: 14px;
  min-height: ${TOP_BAR_MIN_HEIGHT};
  padding: ${(props) => props.theme.spacing(2)};
`;

const TitleContainer = styled.div`
  display: flex;
  font-family: 'Inter';
  font-size: 14px;
  margin-left: 4px;
  width: 100%;
`;

const AddButtonContainer = styled.div`
  align-items: center;
  border: 1px solid ${(props) => props.theme.primaryBorder};
  border-radius: 4px;
  color: ${(props) => props.theme.text80};
  cursor: pointer;
  display: flex;
  flex-shrink: 0;
  height: 28px;
  justify-content: center;
  justify-self: flex-end;
  margin-right: ${(props) => props.theme.spacing(1)};
  user-select: none;
  width: 28px;
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
