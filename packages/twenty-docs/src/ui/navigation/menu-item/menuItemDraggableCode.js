import { IconBell } from "@tabler/icons-react";
import { IconAlertCircle } from "@tabler/icons-react";
import { MenuItemDraggable } from "@/ui/navigation/menu-item/components/MenuItemDraggable";

export const MyComponent = () => {
  const handleMenuItemClick = (event) => {
    console.log("Menu item clicked!", event);
  };

  return (
    <MenuItemDraggable
      LeftIcon={IconBell}
      accent="default"
      iconButtons={[{ Icon: IconAlertCircle, onClick: handleButtonClick }]}
      isTooltipOpen={false}
      onClick={handleMenuItemClick}
      text="Menu item draggable"
      isDragDisabled={false}
      className
    />
  );
};
