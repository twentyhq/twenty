import styled from '@emotion/styled';

const StyledDropdownMenuSectionLabel = styled.div`
  background-color: ${({ theme }) => theme.background.transparent.lighter};
  color: ${({ theme }) => theme.font.color.light};
  min-height: 20px;
  width: auto;
  font-size: ${({ theme }) => theme.font.size.xxs};
  display: flex-start;
  align-items: center;
  justify-content: left;
  padding-left: ${({ theme }) => theme.spacing(1)};
  user-select: none;
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
