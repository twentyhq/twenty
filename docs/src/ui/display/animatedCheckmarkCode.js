import { AnimatedCheckmark } from "@/ui/display/checkmark/components/AnimatedCheckmark";

export const MyComponent = () => {
  return (
    <>
      <div style={{ display: "flex", alignItems: "center" }}>
        <AnimatedCheckmark
          isAnimating={true}
          color="green"
          duration={0.5}
          size={30}
        />
        <p style={{ marginLeft: "8px" }}> Task Completed</p>
      </div>
    </>
  );
};
