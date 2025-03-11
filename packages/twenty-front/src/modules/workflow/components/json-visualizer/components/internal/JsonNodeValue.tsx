import styled from '@emotion/styled';

const StyledText = styled.span`
  color: ${({ theme }) => theme.font.color.tertiary};
  white-space: pre-wrap;
`;

export const JsonNodeValue = ({ valueAsString }: { valueAsString: string }) => {
  return <StyledText>{valueAsString}</StyledText>;
};
