import { Radio } from "@/ui/input/components/Radio";

export const MyComponent = () => {

  const handleRadioChange = (event) => {
    console.log("Radio button changed:", event.target.checked);
  };

  const handleCheckedChange = (checked) => {
    console.log("Checked state changed:", checked);
  };


  return (
    <Radio
      checked={true}
      value="Option 1"
      onChange={handleRadioChange}
      onCheckedChange={handleCheckedChange}
      size="large"
      disabled={false}
      labelPosition="right"
    />
  );
};
