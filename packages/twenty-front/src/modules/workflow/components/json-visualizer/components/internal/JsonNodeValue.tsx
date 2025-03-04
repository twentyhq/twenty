import styled from '@emotion/styled';

const StyledText = styled.span`
  color: ${({ theme }) => theme.font.color.tertiary};
`;

export const JsonNodeValue = ({ valueAsString }: { valueAsString: string }) => {
  return <StyledText>{valueAsString}</StyledText>;
};
