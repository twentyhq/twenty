import { LightIconButton } from "@/ui/input/button/components/LightIconButton";
import { IconSearch } from "@tabler/icons-react";

export const MyComponent = () => {
  return (
    <LightIconButton
      className
      testId="test1"
      Icon={IconSearch}
      title="Click Me"
      size="small"
      accent="secondary"
      active={true}
      disabled={false}
      focus={true}
      onClick={() => console.log("click")}
    />
  );
};
