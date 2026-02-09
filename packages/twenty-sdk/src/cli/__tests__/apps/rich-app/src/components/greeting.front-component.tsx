import { defineFrontComponent } from '@/sdk';
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
  universalIdentifier: '370ae182-743f-4ecb-b625-7ac48e21f0e5',
  name: 'greeting-component',
  description: 'A component that uses greeting utility',
  component: GreetingComponent,
});
