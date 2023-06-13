import styled from '@emotion/styled';

import NavCollapseButton from '../navbar/NavCollapseButton';

const TitleAndCollapseContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`;

const TitleContainer = styled.div`
  font-size: ${(props) => props.theme.fontSizeLarge};
  font-weight: ${(props) => props.theme.fontWeightSemibold};
  display: flex;
  width: 100%;
`;

type OwnProps = {
  title: string;
};

export function TopTitle({ title }: OwnProps) {
  return (
    <TitleAndCollapseContainer>
      <NavCollapseButton hideIfOpen={true} hideOnDesktop={true} />
      <TitleContainer data-testid="top-bar-title">{title}</TitleContainer>
    </TitleAndCollapseContainer>
  );
}
