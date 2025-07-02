import styled from '@emotion/styled';

const StyledDropdownMenuSectionLabel = styled.div`
  background-color: ${({ theme }) => theme.background.transparent.lighter};
  color: ${({ theme }) => theme.font.color.primary};
  min-height: 20px;
  width: auto;
  font-size: ${({ theme }) => theme.font.size.xs};
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding-left: ${({ theme }) => theme.spacing(1)};
  user-select: none;
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
`;

export type DropdownMenuSectionLabelProps = {
  label: string;
};

export const DropdownMenuSectionLabel = ({
  label,
}: DropdownMenuSectionLabelProps) => {
  return (
    <StyledDropdownMenuSectionLabel>{label}</StyledDropdownMenuSectionLabel>
  );
};
