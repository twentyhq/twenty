import { AppTooltip } from "@/ui/display/tooltip/AppTooltip";

export const MyComponent = () => {
  return (
    <>
      <p id="hoverText" style={{ display: "inline-block" }}>
        Customer Insights
      </p>
      <AppTooltip
        className
        anchorSelect="#hoverText"
        content="Explore customer behavior and preferences"
        delayHide={0}
        offset={6}
        noArrow={false}
        isOpen={true}
        place="bottom"
        positionStrategy="absolute"
      />
    </>
  );
};
