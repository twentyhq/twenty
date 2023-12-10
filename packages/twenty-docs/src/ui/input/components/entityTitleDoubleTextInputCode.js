import { RecoilRoot } from "recoil";
import React, { useState } from "react";
import { EntityTitleDoubleTextInput } from "@/ui/input/components/EntityTitleDoubleTextInput";

export const MyComponent = () => {

    const [firstValue, setFirstValue] = useState(
      "First Value"
    );
    const [secondValue, setSecondValue] = useState(
      "Second Value"
    );

    const handleInputChange = (newFirstValue, newSecondValue) => {
      setFirstValue(newFirstValue);
      setSecondValue(newSecondValue);
    };


  return (
    <RecoilRoot>
      <EntityTitleDoubleTextInput
        firstValue={firstValue}
        secondValue={secondValue}
        firstValuePlaceholder="Enter First Value"
        secondValuePlaceholder="Enter Second Value"
        onChange={handleInputChange}
      />
    </RecoilRoot>
  );
};
