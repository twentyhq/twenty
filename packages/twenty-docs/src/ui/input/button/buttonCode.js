import { Button } from "@/ui/input/button/components/Button";

export const MyComponent = () => {
  return (
    <Button
      className
      Icon={null}
      title="Click Me"
      fullWidth={false}
      variant="primary"
      size="medium"
      position="standalone"
      accent="default"
      soon={false}
      disabled={false}
      focus={true}
      onClick={() => console.log("click")}
    />
  );
};
