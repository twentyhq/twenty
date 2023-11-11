import { Checkmark } from "@/ui/display/checkmark/components/Checkmark";
export const MyComponent = () => {
  return (
    <>
      <div style={{ display: "flex", alignItems: "center" }}>
        <Checkmark /> <p style={{ marginLeft: "8px" }}>Task Completed </p>
      </div>
    </>
  );
};
