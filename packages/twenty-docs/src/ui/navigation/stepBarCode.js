import { StepBar } from "@/ui/navigation/step-bar/components/StepBar";

export const MyComponent = () => {
  return (
    <StepBar activeStep={2}>
      <StepBar.Step>Step 1</StepBar.Step>
      <StepBar.Step>Step 2</StepBar.Step>
      <StepBar.Step>Step 3</StepBar.Step>
    </StepBar>
  );
};
