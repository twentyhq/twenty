import styled from '@emotion/styled';
import { useId } from 'react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { Checkbox } from 'src/front-components/components/Checkbox';

const StyledRow = styled.div<{ $depth: number }>`
  align-items: center;
  background-color: ${() => themeCssVariables.background.secondary};
  display: flex;
  gap: ${() => themeCssVariables.spacing[1]};
  padding: ${() => themeCssVariables.spacing[1]}
    ${() => themeCssVariables.spacing[3]};
  padding-left: calc(
    ${() => themeCssVariables.spacing[3]} + ${({ $depth }) => $depth} *
      ${() => themeCssVariables.spacing[5]}
  );
`;

const StyledLabel = styled.label<{ $disabled: boolean }>`
  color: ${({ $disabled }) =>
    $disabled
      ? themeCssVariables.font.color.tertiary
      : themeCssVariables.font.color.primary};
  cursor: ${({ $disabled }) => ($disabled ? 'default' : 'pointer')};
  font-size: ${() => themeCssVariables.font.size.md};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

type GranolaFolderRowProps = {
  name: string;
  path: string;
  depth: number;
  checked: boolean;
  disabled: boolean;
  onChange: (checked: boolean) => void;
};

export const GranolaFolderRow = ({
  name,
  path,
  depth,
  checked,
  disabled,
  onChange,
}: GranolaFolderRowProps) => {
  const checkboxId = useId();

  return (
    <StyledRow $depth={depth}>
      <Checkbox
        id={checkboxId}
        checked={checked}
        disabled={disabled}
        aria-label={path}
        onChange={onChange}
      />
      <StyledLabel htmlFor={checkboxId} $disabled={disabled} title={path}>
        {name}
      </StyledLabel>
    </StyledRow>
  );
};
