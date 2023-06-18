import styled from '@emotion/styled';

type OwnProps = {
  label: string;
  subLabel?: string;
};

const StyledContainer = styled.div``;

export function SubTitle({ label, subLabel }: OwnProps): JSX.Element {
  return <StyledContainer>{label}</StyledContainer>;
}
