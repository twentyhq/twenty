import { RecoilRoot } from "recoil";
import { AutosizeTextInput } from "@/ui/input/components/AutosizeTextInput";

export const MyComponent = () => {
  return (
    <RecoilRoot>
      <AutosizeTextInput
      onValidate
      minRows={1}
      placeholder="Write a comment"
      onFocus
      variant="icon"
      buttonTitle
      value='' 
      />
    </RecoilRoot>
  );
};
