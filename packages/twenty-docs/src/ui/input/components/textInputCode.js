import { RecoilRoot } from "recoil";
import { TextInput } from "@/ui/input/components/TextInput";

export const MyComponent = () => {
  const handleChange = (text) => {
    console.log("Input changed:", text);
  };

  const handleKeyDown = (event) => {
    console.log("Key pressed:", event.key);
  };

  return (
    <RecoilRoot>
      <TextInput
        className
        label="Username"
        onChange={handleChange}
        fullWidth={false}
        disableHotkeys={false}
        error="Invalid username"
        onKeyDown={handleKeyDown}
        RightIcon={null}
      />
    </RecoilRoot>
  );
};
