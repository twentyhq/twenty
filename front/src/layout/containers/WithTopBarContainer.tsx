import styled from '@emotion/styled';
import TopBar from '../top-bar/TopBar';
import { ReactNode } from 'react';

type OwnProps = {
  children: JSX.Element;
  title: string;
  icon: ReactNode;
  onAddButtonClick?: () => void;
};

const StyledContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  overflow: hidden;
`;

const ContentContainer = styled.div`
  display: flex;
  position: relative;
  flex-direction: column;
  background: ${(props) => props.theme.noisyBackground};
  flex: 1;
  padding-right: ${(props) => props.theme.spacing(3)};
  padding-bottom: ${(props) => props.theme.spacing(3)};
  width: calc(100% - ${(props) => props.theme.spacing(3)});
  height: calc(100% - 54px);
`;

const ContentSubContainer = styled.div`
  display: flex;
  background: ${(props) => props.theme.primaryBackground};
  border-radius: 8px;
  height: 100%;
  flex: 1;
`;

function FullWidthContainer({
  children,
  title,
  icon,
  onAddButtonClick,
}: OwnProps) {
  return (
    <StyledContainer>
      <TopBar title={title} icon={icon} onAddButtonClick={onAddButtonClick} />
      <ContentContainer>
        <ContentSubContainer>{children}</ContentSubContainer>
      </ContentContainer>
    </StyledContainer>
  );
}

export default FullWidthContainer;
