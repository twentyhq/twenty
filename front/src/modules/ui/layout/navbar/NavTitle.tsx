import styled from '@emotion/styled';

type OwnProps = {
  label: string;
};

const StyledTitle = styled.div`
  color: ${({ theme }) => theme.font.color.light};
  display: flex;
  font-size: ${({ theme }) => theme.font.size.xs};
  font-weight: 600;
  padding-bottom: ${({ theme }) => theme.spacing(2)};
  padding-left: ${({ theme }) => theme.spacing(1)};
  padding-top: ${({ theme }) => theme.spacing(8)};
  text-transform: uppercase;
`;

function NavTitle({ label }: OwnProps) {
  return <StyledTitle>{label}</StyledTitle>;
}

export default NavTitle;
