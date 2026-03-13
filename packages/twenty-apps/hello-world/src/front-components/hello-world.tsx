import { useEffect, useState } from 'react';
import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineFrontComponent } from 'twenty-sdk';

export const HelloWorld = () => {
  const client = new CoreApiClient();
  const [data, setData] = useState<any>(undefined);

  useEffect(() => {
    client.query({});
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>Hello, World!</h1>
      <p>This is your first front component.</p>
    </div>
  );
};

export default defineFrontComponent({
  universalIdentifier: 'd371f098-5b2c-42f0-898d-94459f1ee337',
  name: 'hello-world-front-component',
  description: 'A sample front component',
  component: HelloWorld,
});
