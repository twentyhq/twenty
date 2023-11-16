import { FloatingButton } from "@/ui/input/button/components/FloatingButton";
import { FloatingButtonGroup } from "@/ui/input/button/components/FloatingButtonGroup";
import { IconComponent } from "@/ui/display/icon/types/IconComponent";

export const MyComponent = () => {
  return (
    <FloatingButtonGroup size="small">
      <FloatingButton
        className
        Icon={IconComponent}
        title="Click Me"
        size="medium"
        position="standalone"
        applyShadow={true}
        applyBlur={true}
        disabled={false}
        focus={true}
      />
    </FloatingButtonGroup>
  );
};
