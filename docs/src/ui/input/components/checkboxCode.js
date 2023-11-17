import { Checkbox } from "@/ui/input/components/Checkbox";

export const MyComponent = () => {
  return <Checkbox
  checked={true}
  indeterminate={false}
  onChange
  onCheckedChange
  variant="primary" 
  size="small"
  shape="squared"
  />;
};
