import styled from '@emotion/styled';

type OwnProps = {
  label: string;
};

const StyledTitle = styled.div`
  display: flex;
  text-transform: uppercase;
  color: ${(props) => props.theme.text30};
  font-size: 12px;
  font-weight: 600;
  padding-top: 4px;
  padding-bottom: 4px;
  padding-left: 4px;
`;

function NavTitle({ label }: OwnProps) {
  return <StyledTitle>{label}</StyledTitle>;
}

export default NavTitle;
