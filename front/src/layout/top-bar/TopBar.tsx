import styled from '@emotion/styled';
import { ReactNode } from 'react';
import { TbPlus } from 'react-icons/tb';

const TopBarContainer = styled.div`
  display: flex;
  flex-direction: row;
  height: 38px;
  align-items: center;
  background: ${(props) => props.theme.noisyBackground};
  padding: 8px;
  font-size: 14px;
  color: ${(props) => props.theme.text80};
  flex-shrink: 0;
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
  border: 1px solid ${(props) => props.theme.primaryBorder};
  width: 30px;
  height: 30px;
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

function TopBar({ title, icon, onAddButtonClick }: OwnProps) {
  return (
    <>
      <TopBarContainer>
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

export default TopBar;
