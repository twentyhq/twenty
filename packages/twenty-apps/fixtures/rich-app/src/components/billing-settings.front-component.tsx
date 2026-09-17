import { defineSettingsFrontComponent } from 'twenty-sdk/define';

export const BillingSettings = () => {
  return (
    <div style={{ padding: '10px' }}>
      <h2>Billing</h2>
    </div>
  );
};

export default defineSettingsFrontComponent({
  universalIdentifier: 'f2a4c8d0-1b3e-4f5a-9c7d-2e8b6a0f4c11',
  name: 'billing-settings',
  description: 'A settings tab rendered after the sync settings tab',
  component: BillingSettings,
  tab: {
    label: 'Billing',
    icon: 'IconCreditCard',
    position: 2,
  },
});
