import { defineFrontComponent } from '@/sdk';
import { CardDisplay } from '../utils/card-display.component';

export default defineFrontComponent({
  universalIdentifier: '88c15ae2-5f87-4a6b-b48f-1974bbe62eb7',
  name: 'card-component',
  description: 'A component using an external component file',
  component: CardDisplay,
});
