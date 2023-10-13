import styled from '@emotion/styled';

type NavTitleProps = {
  label: string;
};

const StyledTitle = styled.div`
  color: ${({ theme }) => theme.font.color.light};
  display: flex;
  font-size: ${({ theme }) => theme.font.size.xs};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  padding-bottom: ${({ theme }) => theme.spacing(2)};
  padding-left: ${({ theme }) => theme.spacing(1)};
  padding-top: ${({ theme }) => theme.spacing(8)};
  text-transform: uppercase;
`;

const NavTitle = ({ label }: NavTitleProps) => (
  <StyledTitle>{label}</StyledTitle>
);

export default NavTitle;
