import { ProgressBar } from "@/ui/feedback/progress-bar/components/ProgressBar";
export const MyComponent = () => {
  return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            borderRadius: "12px",
            overflow: "hidden",
            boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
            width: "300px",
            padding: '10px'
          }}
        >
          <p>Updated successfully</p>
          <ProgressBar
            duration={6000}
            delay={0}
            easing="easeInOut"
            barHeight={10}
            barColor="#4bb543"
            autoStart={true}
          />
        </div>
      </div>
  );
};
