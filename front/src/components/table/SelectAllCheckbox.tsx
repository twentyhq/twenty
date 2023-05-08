import Checkbox from '../form/Checkbox';

export const SelectAllCheckbox = ({
  indeterminate,
  onChange,
}: {
  indeterminate?: boolean;
  onChange?: any;
} & React.HTMLProps<HTMLInputElement>) => {
  return (
    <Checkbox
      name="select-all-checkbox"
      id="select-all-checkbox"
      indeterminate={indeterminate}
      onChange={onChange}
    />
  );
};
