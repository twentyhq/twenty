import { LightButton } from "@/ui/input/button/components/LightButton";

export const MyComponent = () => {
  return <LightButton
  className
  icon={null}
  title="Click Me"
  accent="secondary"
  active={false}
  disabled={false}
  focus={true}
  onClick={()=>console.log('click')} 
  />;
};
