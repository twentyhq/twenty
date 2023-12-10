import { Toggle } from "@/ui/input/components/Toggle";

export const MyComponent = () => {
  return (
    <Toggle
    value = {true}
    onChange = {()=>console.log('On Change event')}
    color="green"
    toggleSize = "medium"
    />
  );
};
