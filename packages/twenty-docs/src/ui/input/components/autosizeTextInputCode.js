import { RecoilRoot } from "recoil";
import { AutosizeTextInput } from "@/ui/input/components/AutosizeTextInput";

export const MyComponent = () => {
  return (
    <RecoilRoot>
      <AutosizeTextInput
        onValidate={() => console.log("onValidate function fired")}
        minRows={1}
        placeholder="Write a comment"
        onFocus={() => console.log("onFocus function fired")}
        variant="icon"
        buttonTitle
        value="Task: "
      />
    </RecoilRoot>
  );
};
