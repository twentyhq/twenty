import { FloatingButton } from "@/ui/input/button/components/FloatingButton";
import { FloatingButtonGroup } from "@/ui/input/button/components/FloatingButtonGroup";
import { IconClipboardText, IconCheckbox } from "@tabler/icons-react";

export const MyComponent = () => {
  return (
    <FloatingButtonGroup size="small">
      <FloatingButton
        className
        Icon={IconClipboardText}
        title
        size="small"
        position="standalone"
        applyShadow={true}
        applyBlur={true}
        disabled={false}
        focus={true}
      />
      <FloatingButton
        className
        Icon={IconCheckbox}
        title
        size="small"
        position="standalone"
        applyShadow={true}
        applyBlur={true}
        disabled={false}
      />
    </FloatingButtonGroup>
  );
};
