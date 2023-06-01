import * as React from 'react';
import styled from '@emotion/styled';
import { Checkbox } from '../form/Checkbox';

type OwnProps = {
  name: string;
  id: string;
  checked?: boolean;
  indeterminate?: boolean;
  onChange?: (newCheckedValue: boolean) => void;
};

const StyledContainer = styled.div`
  width: 32px;
  height: 32px;
  margin-left: -${(props) => props.theme.table.horizontalCellMargin};
  padding-left: ${(props) => props.theme.table.horizontalCellMargin};

  display: flex;
  align-items: center;
  justify-content: center;

  cursor: pointer;
`;

export function CheckboxCell({
  name,
  id,
  checked,
  onChange,
  indeterminate,
}: OwnProps) {
  const [internalChecked, setInternalChecked] = React.useState(checked);

  function handleContainerClick() {
    handleCheckboxChange(!internalChecked);
  }

  React.useEffect(() => {
    setInternalChecked(checked);
  }, [checked]);

  function handleCheckboxChange(newCheckedValue: boolean) {
    setInternalChecked(newCheckedValue);

    if (onChange) {
      onChange(newCheckedValue);
    }
  }

  return (
    <StyledContainer
      onClick={handleContainerClick}
      data-testid="input-checkbox-cell-container"
    >
      <Checkbox
        id={id}
        name={name}
        checked={internalChecked}
        onChange={handleCheckboxChange}
        indeterminate={indeterminate}
      />
    </StyledContainer>
  );
}
