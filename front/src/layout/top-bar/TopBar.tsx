import styled from '@emotion/styled';
import { ReactNode } from 'react';

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
  icon: ReactNode;
};

function TopBar({ title, icon }: OwnProps) {
  return (
    <>
      <TopBarContainer>
        {icon}
        <TitleContainer data-testid="top-bar-title">{title}</TitleContainer>
      </TopBarContainer>
    </>
  );
}

export default TopBar;
