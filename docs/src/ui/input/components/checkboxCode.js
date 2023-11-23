import { Checkbox } from "@/ui/input/components/Checkbox";

export const MyComponent = () => {
  return (
    <Checkbox
      checked={true}
      indeterminate={false}
      onChange={() => console.log("onChange function fired")}
      onCheckedChange={() => console.log("onCheckedChange function fired")}
      variant="primary"
      size="small"
      shape="squared"
    />
  );
};
