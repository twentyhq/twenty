import styled from '@emotion/styled';

const Separator = styled.div`
  background-color: ${(props) => props.theme.mediumBorder};
  height: 1px;
  margin-bottom: ${(props) => props.theme.spacing(3)};
  margin-top: ${(props) => props.theme.spacing(3)};
  width: 100%;
`;

export function HorizontalSeparator(): JSX.Element {
  return <Separator />;
}
