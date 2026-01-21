import { defineFrontComponent } from '@/application/front-components/define-front-component';
import { CardDisplay } from '../utils/card-display.component';

export default defineFrontComponent({
  universalIdentifier: 'i0i1i2i3-i4i5-4000-8000-000000000001',
  name: 'card-component',
  description: 'A component using an external component file',
  component: CardDisplay,
});
