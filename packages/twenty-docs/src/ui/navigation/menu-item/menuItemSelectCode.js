import { IconBell } from "@tabler/icons-react";
import { MenuItemSelect } from "@/ui/navigation/menu-item/components/MenuItemSelect";

export const MyComponent = () => {
  const handleSelection = () => {
    console.log("Menu item selected");
  };

  return (
    <MenuItemSelect
      LeftIcon={IconBell}
      text="First Option"
      selected={true}
      disabled={false}
      hovered={false}
      onClick={handleSelection}
      className
    />
  );
};
