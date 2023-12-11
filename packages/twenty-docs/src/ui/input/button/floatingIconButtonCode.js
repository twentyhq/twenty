import { FloatingIconButton } from "@/ui/input/button/components/FloatingIconButton";
import { IconSearch } from "@tabler/icons-react";

export const MyComponent = () => {
  return (
    <FloatingIconButton
      className
      Icon={IconSearch}
      size="small"
      position="standalone"
      applyShadow={true}
      applyBlur={true}
      disabled={false}
      focus={false}
      onClick={() => console.log("click")}
      isActive={true}
    />
  );
};
