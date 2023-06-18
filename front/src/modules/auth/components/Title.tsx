import styled from '@emotion/styled';

type OwnProps = {
  title: string;
};

const StyledTitle = styled.div`
  font-size: ${({ theme }) => theme.fontSizeExtraLarge};
  font-weight: ${({ theme }) => theme.fontWeightSemibold};
  margin-top: ${({ theme }) => theme.spacing(10)};
`;

export function Title({ title }: OwnProps): JSX.Element {
  return <StyledTitle>{title}</StyledTitle>;
}
