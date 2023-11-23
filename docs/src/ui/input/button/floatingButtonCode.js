import { FloatingButton } from "@/ui/input/button/components/FloatingButton";
import { IconSearch } from "@tabler/icons-react";

export const MyComponent = () => {
  return (
    <FloatingButton
      className
      Icon={IconSearch}
      title="Click Me"
      size="medium"
      position="standalone"
      applyShadow={true}
      applyBlur={true}
      disabled={false}
      focus={true}
    />
  );
};
