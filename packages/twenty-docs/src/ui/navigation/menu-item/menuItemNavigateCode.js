import { IconBell } from "@tabler/icons-react";
import { MenuItemNavigate } from "@/ui/navigation/menu-item/components/MenuItemNavigate";

export const MyComponent = () => {
  const handleNavigation = () => {
    console.log("Navigate to another page");
  };

  return (
    <MenuItemNavigate
      LeftIcon={IconBell}
      text="First Option"
      onClick={handleNavigation}
      className
    />
  );
};
