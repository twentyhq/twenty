import { AnimatedCheckmark } from "@/ui/display/checkmark/components/AnimatedCheckmark";

export const MyComponent = () => {
  return (
    <AnimatedCheckmark
      isAnimating={true}
      color="green"
      duration={0.5}
      size={30}
    />
  );
  
  
};
