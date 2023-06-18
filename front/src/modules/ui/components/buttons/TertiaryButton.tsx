import styled from '@emotion/styled';

type OwnProps = {
  text: string;
};

const StyledButton = styled.button``;

export function TertiaryButton({ text }: OwnProps): JSX.Element {
  return <StyledButton>{text}</StyledButton>;
}
