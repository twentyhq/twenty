import { IconBell } from "@tabler/icons-react";
import { MenuItemToggle } from "@/ui/navigation/menu-item/components/MenuItemToggle";

export const MyComponent = () => {
  const handleToggleChange = (toggled) => {
    console.log(`Toggle state changed: ${toggled}`);
  };

  return (
    <MenuItemToggle
      LeftIcon={IconBell}
      text="First Option"
      toggled={true}
      onToggleChange={handleToggleChange}
      toggleSize="small"
      className
    />
  );
};
