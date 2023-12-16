import { IconBell } from "@tabler/icons-react";
import { MenuItemCommand } from "@/ui/navigation/menu-item/components/MenuItemCommand";

export const MyComponent = () => {
  const handleCommandClick = () => {
    console.log("Command clicked!");
  };

  return (
    <MenuItemCommand
      LeftIcon={IconBell}
      text="First Option"
      firstHotKey="⌘"
      secondHotKey="1"
      isSelected={true}
      onClick={handleCommandClick}
      className
    />
  );
};
