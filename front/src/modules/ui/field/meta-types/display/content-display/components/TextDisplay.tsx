import styled from '@emotion/styled';

const StyledTextInputDisplay = styled.div`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  width: 100%;
`;

type TextDisplayProps = {
  text: string;
};

export const TextDisplay = ({ text }: TextDisplayProps) => (
  <StyledTextInputDisplay>{text}</StyledTextInputDisplay>
);
