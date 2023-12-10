import { RecoilRoot } from "recoil";
import React, { useState } from "react";
import { IconPicker } from "@/ui/input/components/IconPicker";

export const MyComponent = () => {

   const [selectedIcon, setSelectedIcon] = useState("");
   const handleIconChange = ({ iconKey, Icon }) => {
     console.log("Selected Icon:", iconKey);
     setSelectedIcon(iconKey);
   };

  return (
    <RecoilRoot>
      <IconPicker
        disabled={false}
        onChange={handleIconChange}
        selectedIconKey={selectedIcon}
        variant="primary"
      />
    </RecoilRoot>
  );
};
