import { MenuItemSelectColor } from "@/ui/navigation/menu-item/components/MenuItemSelectColor";

export const MyComponent = () => {
  const handleSelection = () => {
    console.log("Menu item selected");
  };

  return (
    <MenuItemSelectColor
      color="green"
      selected={true}
      disabled={false}
      hovered={true}
      variant="default"
      onClick={handleSelection}
      className
    />
  );
};
