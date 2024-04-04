import { RecoilRoot } from 'recoil';
import { IconComponent } from 'twenty-ui';

import { Select } from '@/ui/input/components/Select';

export const MyComponent = () => {
  const handleSelectChange = (selectedValue) => {
    console.log(`Selected: ${selectedValue}`);
  };

  return (
    <RecoilRoot>
      <Select
        className
        disabled={false}
        dropdownScopeId="exampleDropdown"
        label="Select an option"
        onChange={handleSelectChange}
        options={[
          { value: 'option1', label: 'Option A', Icon: IconComponent },
          { value: 'option2', label: 'Option B', Icon: IconComponent },
        ]}
        value="option1"
      />
    </RecoilRoot>
  );
};
