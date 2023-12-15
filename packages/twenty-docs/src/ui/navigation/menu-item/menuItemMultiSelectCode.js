import { IconBell } from "@tabler/icons-react";
import { MenuItemMultiSelect } from "@/ui/navigation/menu-item/components/MenuItemMultiSelect";

export const MyComponent = () => {
  const handleSelectChange = (selected) => {
    console.log(`Item selected: ${selected}`);
  };

  return (
    <MenuItemMultiSelect
      LeftIcon={IconBell}
      text="First Option"
      selected={false}
      onSelectChange={handleSelectChange}
      className
    />
  );
};
