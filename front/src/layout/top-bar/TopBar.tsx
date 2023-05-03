import styled from '@emotion/styled';
import { IconType } from 'react-icons/lib';
import ReactIcon from '../../components/icons/ReactIcon';

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
`;

type OwnProps = {
  title: string;
  icon: IconType;
};

function TopBar({ title, icon }: OwnProps) {
  return (
    <>
      <TopBarContainer>
        <ReactIcon icon={icon} />
        <TitleContainer data-testid="top-bar-title">{title}</TitleContainer>
      </TopBarContainer>
    </>
  );
}

export default TopBar;
