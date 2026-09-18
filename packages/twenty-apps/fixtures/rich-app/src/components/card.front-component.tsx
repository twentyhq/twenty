import { defineFrontComponent } from 'twenty-sdk/define';
import { CardDisplay } from '../utils/card-display.component';

// The cast is the point: settingsTab is not part of the config, and the build
// has to drop a stray one rather than let it mark this component a settings tab
export default defineFrontComponent({
  universalIdentifier: '88c15ae2-5f87-4a6b-b48f-1974bbe62eb7',
  name: 'card-component',
  description: 'A component using an external component file',
  component: CardDisplay,
  settingsTab: { label: 'Smuggled' },
} as unknown as Parameters<typeof defineFrontComponent>[0]);
