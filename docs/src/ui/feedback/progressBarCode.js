import { ProgressBar } from "@/ui/feedback/progress-bar/components/ProgressBar";

export const MyComponent = () => {
  return (
    <ProgressBar
      duration={6000}
      delay={0}
      easing="easeInOut"
      barHeight={10}
      barColor="#4bb543"
      autoStart={true}
    />
  );
};
