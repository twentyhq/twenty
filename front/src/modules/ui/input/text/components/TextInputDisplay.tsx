import styled from '@emotion/styled';

const StyledTextInputDisplay = styled.div`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  width: 100%;
`;

export type TextInputDisplayProps = {
  children: React.ReactNode;
};

export function TextInputDisplay({ children }: TextInputDisplayProps) {
  return <StyledTextInputDisplay>{children}</StyledTextInputDisplay>;
}
