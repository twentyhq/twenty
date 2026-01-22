import { defineFrontComponent } from '@/application/front-components/define-front-component';
import { DEFAULT_NAME, formatGreeting } from '../utils/greeting.util';

const GreetingComponent = () => {
  const message = formatGreeting(DEFAULT_NAME);

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>{message}</h1>
    </div>
  );
};

export default defineFrontComponent({
  universalIdentifier: 'h0h1h2h3-h4h5-4000-8000-000000000001',
  name: 'greeting-component',
  description: 'A component that uses greeting utility',
  component: GreetingComponent,
});
