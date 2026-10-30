import { TextInput } from '@/ui/input/components/TextInput';
import { isDropdownOpenComponentState } from '@/ui/layout/dropdown/states/isDropdownOpenComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useState, type FocusEvent, type FormEvent } from 'react';

type TextInputDropdownFormProps = {
  defaultValue: string;
  label: string;
  onSubmit: (value: string) => void;
};

export const TextInputDropdownForm = ({
  defaultValue,
  label,
  onSubmit,
}: TextInputDropdownFormProps) => {
  const [value, setValue] = useState(defaultValue);
  const isDropdownOpen = useAtomComponentStateValue(
    isDropdownOpenComponentState,
  );

  const handleSubmit = (
    event: FormEvent<HTMLFormElement> | FocusEvent<HTMLInputElement>,
  ) => {
    event.preventDefault();

    if (!isDropdownOpen) {
      return;
    }

    onSubmit(value);
  };

  return (
    <form onSubmit={handleSubmit}>
      <TextInput
        aria-label={label}
        placeholder={label}
        value={value}
        onChange={setValue}
        onBlur={handleSubmit}
        autoFocus
      />
    </form>
  );
};
