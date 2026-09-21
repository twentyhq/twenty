import { useState } from 'react';
import { defineFrontComponent } from 'twenty-sdk/define';

export const Counter = () => {
  const [count, setCount] = useState(0);

  return (
    <div>
      <span>{count}</span>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  );
};

export default defineFrontComponent({
  universalIdentifier: 'e1e2e3e4-e5e6-4000-8000-000000000103',
  name: 'counter',
  description: 'A component relying on the shared react',
  component: Counter,
});
