import { Tag } from "@/ui/display/tag/components/Tag";

export const MyComponent = () => {
  return (
    <Tag
      className
      color="red"
      text="Urgent"
      onClick={() => console.log("click")}
    />
  );
};
