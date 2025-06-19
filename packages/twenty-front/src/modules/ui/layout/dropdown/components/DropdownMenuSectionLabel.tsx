import styled from '@emotion/styled';

const StyledDropdownMenuSectionLabel = styled.div<{
  isSubsectionLabel?: boolean;
}>`
  background-color: ${({ theme }) => theme.background.transparent.lighter};
  color: ${({ theme, isSubsectionLabel }) =>
    isSubsectionLabel ? theme.font.color.tertiary : theme.font.color.light};
  min-height: 20px;
  width: auto;
  font-size: ${({ theme, isSubsectionLabel }) =>
    isSubsectionLabel ? theme.font.size.xs : theme.font.size.xxs};
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding-left: ${({ theme }) => theme.spacing(1)};
  user-select: none;
`;

export type DropdownMenuSectionLabelProps = {
  label: string;
  isSubsectionLabel?: boolean;
};

export const DropdownMenuSectionLabel = ({
  label,
  isSubsectionLabel = false,
}: DropdownMenuSectionLabelProps) => {
  return (
    <StyledDropdownMenuSectionLabel isSubsectionLabel={isSubsectionLabel}>
      {label}
    </StyledDropdownMenuSectionLabel>
  );
};
