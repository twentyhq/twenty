import { SoonPill } from "@/ui/display/pill/components/SoonPill";
export const MyComponent = () => {
  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      <div style={{ flex: "0 0 auto", marginRight: "8px" }}>
        <SoonPill />
      </div>
      <p>Notifications</p>
    </div>
  );
};
