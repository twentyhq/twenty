import { SoonPill } from "@/ui/display/pill/components/SoonPill";
export const MyComponent = () => {
  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      <div>
        <SoonPill />
      </div>
      <p>Notifications</p>
    </div>
  );
};
