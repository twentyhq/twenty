import { styled } from '@linaria/react';
import { IconPlus } from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledAddNewRow = styled.button`
  align-items: center;
  background: transparent;
  border: none;
  border-top: 1px solid ${themeCssVariables.border.color.light};
  color: ${themeCssVariables.font.color.tertiary};
  cursor: pointer;
  display: flex;
  font-family: inherit;
  font-size: ${themeCssVariables.font.size.md};
  gap: ${themeCssVariables.spacing[1]};
  height: ${themeCssVariables.spacing[8]};
  padding: 0 ${themeCssVariables.spacing[2]};
  width: 100%;

  &:hover {
    background-color: ${themeCssVariables.background.transparent.light};
    color: ${themeCssVariables.font.color.secondary};
  }
`;

type CoreObjectTableAddNewRowProps = {
  label: string;
  onClick: () => void;
};

export const CoreObjectTableAddNewRow = ({
  label,
  onClick,
}: CoreObjectTableAddNewRowProps) => (
  <StyledAddNewRow type="button" onClick={onClick}>
    <IconPlus size={14} />
    {label}
  </StyledAddNewRow>
);
