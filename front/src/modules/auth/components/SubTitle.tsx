import styled from '@emotion/styled';

type OwnProps = {
  subTitle: string;
};

const StyledSubTitle = styled.div``;

export function SubTitle({ subTitle }: OwnProps): JSX.Element {
  return <StyledSubTitle>{subTitle}</StyledSubTitle>;
}
