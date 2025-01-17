import { NavigationDrawerInput } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerInput';
import { NavigationDrawerItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItem';
import { useState } from 'react';

type NavigationDrawerItemInputProps = {
  isRenaming: boolean;
  setIsRenaming: (isRenaming: boolean) => void;
  defaultValue: string;
  placeholder: string;
  handleSubmit: (value: string) => void;
  handleCancel: () => void;
};

export const NavigationDrawerItemInput = ({
  isRenaming,
  setIsRenaming,
  defaultValue,
  placeholder,
  handleSubmit,
  handleCancel,
}: NavigationDrawerItemInputProps) => {
  const [value, setValue] = useState<string>(defaultValue);

  return isRenaming ? (
    <NavigationDrawerInput
      placeholder={placeholder}
      value={value}
      onChange={setValue}
      onSubmit={handleSubmit}
      onCancel={() => {
        setValue(defaultValue);
        handleCancel();
      }}
      onClickOutside={handleCancel}
      hotkeyScope="favorites-folder-input"
    />
  ) : (
    <NavigationDrawerItem
      label={value}
      onClick={() => setIsRenaming(true)}
      rightOptions={undefined}
      className="navigation-drawer-item"
      active
    />
  );
};
