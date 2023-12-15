import { IconBell } from "@tabler/icons-react";
import { IconAlertCircle } from "@tabler/icons-react";
import { MenuItem } from "@/ui/navigation/menu-item/components/MenuItem";

export const MyComponent = () => {
  const handleMenuItemClick = (event) => {
    console.log("Menu item clicked!", event);
  };

  const handleButtonClick = (event) => {
    console.log("Icon button clicked!", event);
  };

  return (
    <MenuItem
      LeftIcon={IconBell}
      accent="default"
      text="Menu item text"
      iconButtons={[{ Icon: IconAlertCircle, onClick: handleButtonClick }]}
      isTooltipOpen={true}
      testId="menu-item-1"
      onClick={handleMenuItemClick}
      className
    />
  );
};
