import styled from '@emotion/styled';

const StyledTextInputDisplay = styled.div`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  width: 100%;
`;

type OwnProps = {
  text: string;
};

export function TextDisplay({ text }: OwnProps) {
  return <StyledTextInputDisplay>{text}</StyledTextInputDisplay>;
}
