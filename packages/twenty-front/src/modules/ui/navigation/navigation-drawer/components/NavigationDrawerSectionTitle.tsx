import styled from '@emotion/styled';

type NavigationDrawerSectionTitleProps = {
  label: string;
};

const StyledTitle = styled.div`
  color: ${({ theme }) => theme.font.color.light};
  display: flex;
  font-size: ${({ theme }) => theme.font.size.xs};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  padding: ${({ theme }) => theme.spacing(1)};
  padding-top: 0;
`;

export const NavigationDrawerSectionTitle = ({
  label,
}: NavigationDrawerSectionTitleProps) => <StyledTitle>{label}</StyledTitle>;
