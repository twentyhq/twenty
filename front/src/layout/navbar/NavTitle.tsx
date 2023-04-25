import styled from '@emotion/styled';

type OwnProps = {
  label: string;
};

const StyledTitle = styled.div`
  display: flex;
  text-transform: uppercase;
  color: ${(props) => props.theme.text30};
  font-size: ${(props) => props.theme.fontSizeExtraSmall};
  font-weight: 600;
  padding-top: ${(props) => props.theme.spacing(1)};
  padding-bottom: ${(props) => props.theme.spacing(1)};
  padding-left: ${(props) => props.theme.spacing(1)};
`;

function NavTitle({ label }: OwnProps) {
  return <StyledTitle>{label}</StyledTitle>;
}

export default NavTitle;
