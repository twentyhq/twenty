import { useEffect, useState } from 'react';
import { CoreApiClient, CoreSchema } from 'twenty-client-sdk/core';
import { defineFrontComponent } from 'twenty-sdk/define';

export const HELLO_WORLD_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER =
  '7a758f23-5e7d-497d-98c9-7ca8d6c085b0';

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
  universalIdentifier: HELLO_WORLD_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  name: 'hello-world-front-component',
  description: 'A sample front component',
  component: HelloWorld,
});
