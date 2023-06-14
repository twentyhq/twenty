import styled from '@emotion/styled';

type OwnProps = {
  label: string;
};

const StyledTitle = styled.div`
  color: ${(props) => props.theme.text30};
  display: flex;
  font-size: ${(props) => props.theme.fontSizeExtraSmall};
  font-weight: 600;
  padding-bottom: ${(props) => props.theme.spacing(2)};
  padding-left: ${(props) => props.theme.spacing(1)};
  padding-top: ${(props) => props.theme.spacing(8)};
  text-transform: uppercase;
`;

function NavTitle({ label }: OwnProps) {
  return <StyledTitle>{label}</StyledTitle>;
}

export default NavTitle;
