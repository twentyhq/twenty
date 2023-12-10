import { MainButton } from "@/ui/input/button/components/MainButton";
import { IconCheckbox } from "@tabler/icons-react";

export const MyComponent = () => {
  return (
    <MainButton
      title="Checkbox"
      fullWidth={false}
      variant="primary"
      soon={false}
      Icon={IconCheckbox}
    />
  );
};
