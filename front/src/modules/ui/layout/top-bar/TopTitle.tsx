import styled from '@emotion/styled';

import NavCollapseButton from '../navbar/NavCollapseButton';

const TitleContainer = styled.div`
  font-family: 'Inter';
  margin-left: 4px;
  font-size: 18px;
  display: flex;
  width: 100%;
`;

type OwnProps = {
  title: string;
};

export function TopTitle({ title }: OwnProps) {
  return (
    <>
      <NavCollapseButton hideIfOpen={true} hideOnDesktop={true} />
      <TitleContainer data-testid="top-bar-title">{title}</TitleContainer>
    </>
  );
}
