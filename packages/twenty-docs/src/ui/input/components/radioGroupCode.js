import React, { useState } from "react";
import { Radio } from "@/ui/input/components/Radio";
import { RadioGroup } from "@/ui/input/components/RadioGroup";

export const MyComponent = () => {

  const [selectedValue, setSelectedValue] = useState("Option 1");

  const handleChange = (event) => {
    setSelectedValue(event.target.value);
  };
  
  return (
    <RadioGroup value={selectedValue} onChange={handleChange}>
      <Radio value="Option 1" />
      <Radio value="Option 2" />
      <Radio value="Option 3" />
    </RadioGroup>
  );
};
