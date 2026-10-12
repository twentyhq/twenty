import { useState } from 'react';
import { Menu } from 'twenty-ui/primitives/surfaces';
import { Text } from 'twenty-ui/primitives/typography';

export const MenuSelectionExample = () => {
  const [checked, setChecked] = useState(true);
  const [checkboxReason, setCheckboxReason] = useState('none');
  const [radioValue, setRadioValue] = useState('compact');
  const [radioReason, setRadioReason] = useState('none');
  const [cancelledReason, setCancelledReason] = useState('none');

  return (
    <>
      <Menu.CheckboxItem
        aria-label="Notifications"
        checked={checked}
        onCheckedChange={(nextChecked, details) => {
          setChecked(nextChecked);
          setCheckboxReason(details.reason);
        }}
      >
        Notifications
        <Menu.CheckboxItemIndicator data-menu-checkbox-indicator="">
          ✓
        </Menu.CheckboxItemIndicator>
      </Menu.CheckboxItem>
      <Menu.CheckboxItem
        aria-label="Protected preference"
        defaultChecked={false}
        onCheckedChange={(_, details) => {
          setCancelledReason(details.reason);
          details.cancel();
        }}
      >
        Protected preference
      </Menu.CheckboxItem>
      <Menu.RadioGroup
        defaultValue="compact"
        onValueChange={(value, details) => {
          setRadioValue(value);
          setRadioReason(details.reason);
        }}
      >
        <Menu.RadioItem value="compact" aria-label="Compact">
          Compact
          <Menu.RadioItemIndicator data-menu-radio-indicator="">
            ✓
          </Menu.RadioItemIndicator>
        </Menu.RadioItem>
        <Menu.RadioItem value="comfortable" aria-label="Comfortable">
          Comfortable
          <Menu.RadioItemIndicator data-menu-radio-indicator="">
            ✓
          </Menu.RadioItemIndicator>
        </Menu.RadioItem>
      </Menu.RadioGroup>
      <Text role="status" aria-label="Checkbox request">
        Notifications: {checked ? 'checked' : 'unchecked'}; reason:{' '}
        {checkboxReason}
      </Text>
      <Text role="status" aria-label="Radio request">
        Density: {radioValue}; reason: {radioReason}
      </Text>
      <Text role="status" aria-label="Cancelled checkbox request">
        Protected reason: {cancelledReason}
      </Text>
    </>
  );
};
