import { FloatingIconButton } from "@/ui/input/button/components/FloatingIconButton";
import { IconSearch } from "@tabler/icons-react";

export const MyComponent = () => {
  return (
    <FloatingIconButton
      className
      Icon={IconSearch}
      size="small"
      position="middle"
      applyShadow={true}
      applyBlur={false}
      disabled={false}
      focus={true}
      onClick={() => console.log("click")}
      isActive={true}
    />
  );
};
