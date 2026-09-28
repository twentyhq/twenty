import { defineFrontComponent } from 'twenty-sdk/define';
import { CardPicker } from 'twenty-ui/components';
import { RadioGroup, SegmentedControl } from 'twenty-ui/primitives/input';
import { TextDirectionProvider } from 'twenty-ui/primitives/layout';
import 'twenty-ui/style.css';

const DirectionalControls = () => (
  <TextDirectionProvider direction="rtl">
    <div dir="rtl">
      <RadioGroup aria-label="Plan" defaultValue="team">
        <CardPicker value="team">Team plan</CardPicker>
      </RadioGroup>
      <SegmentedControl
        aria-label="Billing"
        defaultValue="annual"
        options={[
          { label: 'Annual', value: 'annual' },
          { label: 'Monthly', value: 'monthly' },
        ]}
      />
    </div>
  </TextDirectionProvider>
);

export default defineFrontComponent({
  universalIdentifier: '7c1fe253-48a0-4fbb-9202-8f1b4d59735f',
  name: 'twenty-ui-directional-controls',
  description: 'Directional controls compatibility probe',
  component: DirectionalControls,
});
