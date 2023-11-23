import { Chip } from "@/ui/display/chip/components/Chip";

export const MyComponent = () => {
  return (
    <Chip
      size="large"
      label="Clickable Chip"
      clickable={true}
      variant="highlighted"
      accent="text-primary"
      leftComponent
      rightComponent
      maxWidth="200px"
      className
    />
  );
};
