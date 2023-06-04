import { CheckboxCell } from './CheckboxCell';

export const SelectAllCheckbox = ({
  indeterminate,
  onChange,
}: {
  indeterminate?: boolean;
  onChange?: (newCheckedValue: boolean) => void;
} & React.HTMLProps<HTMLInputElement>) => {
  return (
    <CheckboxCell
      name="select-all-checkbox"
      id="select-all-checkbox"
      indeterminate={indeterminate}
      onChange={onChange}
    />
  );
};
