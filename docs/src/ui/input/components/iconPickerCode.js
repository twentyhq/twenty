import { RecoilRoot } from "recoil";
import { IconPicker } from "@/ui/input/components/IconPicker";

export const MyComponent = () => {
  return (
    <RecoilRoot>
      <IconPicker
      disabled={false}
      onChange
      selectedIconKey
      onClickOutside
      onClose
      onOpen
      variant="primary" 
      />
    </RecoilRoot>
  );
};
