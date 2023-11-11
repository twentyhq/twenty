import { Tag } from "@/ui/display/tag/components/Tag";
export const MyComponent = () => {
  return (
    <>
      <div style={{ display: "flex", alignItems: "center" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            width: "100%",
          }}
        >
          <span>Implement user profile customization feature</span>
          <Tag
            className
            color="green"
            text="Feature enhancement"
            onClick={() => console.log("click")}
          />
        </div>
      </div>
    </>
  );
};
