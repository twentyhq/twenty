import { Button } from "@/ui/input/button/components/Button";
import { ButtonGroup } from "@/ui/input/button/components/ButtonGroup";

export const MyComponent = () => {
  return (
    <ButtonGroup variant="primary" size="large" accent="blue" className>
      <Button
        className
        Icon={null}
        title="Button 1"
        fullWidth={false}
        variant="primary"
        size="medium"
        position="standalone"
        accent="blue"
        soon={false}
        disabled={false}
        focus={false}
        onClick={() => console.log("click")}
      />
      <Button
        className
        Icon={null}
        title="Button 2"
        fullWidth={false}
        variant="secondary"
        size="medium"
        position="left"
        accent="blue"
        soon={false}
        disabled={false}
        focus={false}
        onClick={() => console.log("click")}
      />
      <Button
        className
        Icon={null}
        title="Button 3"
        fullWidth={false}
        variant="tertiary"
        size="medium"
        position="right"
        accent="blue"
        soon={false}
        disabled={false}
        focus={false}
        onClick={() => console.log("click")}
      />
    </ButtonGroup>
  );
};
