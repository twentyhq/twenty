import { defineSettingsFrontComponent } from 'twenty-sdk/define';

export const SyncSettings = () => {
  return (
    <div style={{ padding: '10px' }}>
      <h2>Sync</h2>
    </div>
  );
};

export default defineSettingsFrontComponent({
  universalIdentifier: 'a1b3d7e9-0c2f-4e6b-8d5a-1f7c9b3e5a22',
  name: 'sync-settings',
  description: 'A settings tab rendered before the billing settings tab',
  component: SyncSettings,
  tab: {
    label: 'Sync',
    icon: 'IconRefresh',
    position: 1,
  },
});
