import { useEffect, useState } from 'react';
import { CoreApiClient, CoreSchema } from 'twenty-client-sdk/core';
import { defineFrontComponent } from 'twenty-sdk';

export const HelloWorld = () => {
  const client = new CoreApiClient();
  const [data, setData] = useState<
    Pick<CoreSchema.Company, 'name' | 'id'> | undefined
  >(undefined);

  useEffect(() => {
    const fetchData = async () => {
      const response = await client.query({
        company: {
          name: true,
          id: true,
          __args: {
            filter: {
              position: {
                eq: 1,
              },
            },
          },
        },
      });

      setData(response.company);
    };

    fetchData();
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>Hello, World!</h1>
      <p>This is your first front component.</p>
      {data ? (
        <div>
          <p>Company name: {data.name}</p>
          <p>Company id: {data.id}</p>
        </div>
      ) : (
        <p>Company not found</p>
      )}
    </div>
  );
};

export default defineFrontComponent({
  universalIdentifier: 'd371f098-5b2c-42f0-898d-94459f1ee337',
  name: 'hello-world-front-component',
  description: 'A sample front component',
  component: HelloWorld,
});
