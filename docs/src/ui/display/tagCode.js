import { Tag } from "@/ui/display/tag/components/Tag";
export const MyComponent = () => {
  return (
    <div style={{ display: "flex"}}>
      <Tag
        className
        color="red"
        text="Urgent"
        onClick={() => console.log("click")}
      />
     
    </div>
  );
};
