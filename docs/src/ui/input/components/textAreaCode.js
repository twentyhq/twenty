import { TextArea } from "@/ui/input/components/TextArea";

export const MyComponent = () => {
  return (
    <TextArea
    disabled={false}
    minRows={4}
    onChange={()=>console.log('On change function fired')}
    placeholder="Enter text here"
    value=""
    />
  );
};
