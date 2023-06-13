import styled from '@emotion/styled';

import NavCollapseButton from '../navbar/NavCollapseButton';

const TitleAndCollapseContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: row;
`;

const TitleContainer = styled.div`
  display: flex;
  font-size: ${(props) => props.theme.fontSizeLarge};
  font-weight: ${(props) => props.theme.fontWeightSemibold};
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
