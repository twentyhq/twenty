import styled from '@emotion/styled';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const TopBarContainer = styled.div`
  display: flex;
  flex-direction: row;
  height: 40px;
  align-items: center;
  background: ${(props) => props.theme.noisyBackground};
  padding: 8px;
  font-size: 14px;
  color: ${(props) => props.theme.text80};
`;

const TitleContainer = styled.div`
  font-family: 'Inter';
  margin-left: 4px;
  font-size: 14px;
`;

type OwnProps = {
  title: string;
  icon: IconProp;
};

function TopBar({ title, icon }: OwnProps) {
  return (
    <>
      <TopBarContainer>
        <FontAwesomeIcon icon={icon} />
        <TitleContainer data-testid="top-bar-title">{title}</TitleContainer>
      </TopBarContainer>
    </>
  );
}

export default TopBar;
