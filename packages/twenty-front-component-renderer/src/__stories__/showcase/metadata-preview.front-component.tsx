import { useEffect, useState } from 'react';
import { z } from 'zod';
import { MetadataApiClient } from 'twenty-client-sdk/metadata';
import { defineFrontComponent } from 'twenty-sdk/define';

const MetadataPreview = () => {
  const [result, setResult] = useState('Loading');
  const load = async () => {
    try {
      const data = await new MetadataApiClient().query({
        object: {
          __args: { id: 'opportunity' },
          fields: {
            __args: { filter: {}, paging: { first: 100 } },
            edges: { node: { name: true, options: true } },
          },
        },
      });
      const options = z
        .array(
          z.object({
            label: z.string(),
            color: z.string(),
            position: z.number(),
          }),
        )
        .parse(data.object.fields.edges[0].node.options);
      setResult(
        [...options]
          .sort((left, right) => left.position - right.position)
          .map((option) => `${option.label} (${option.color})`)
          .join(', '),
      );
    } catch (error) {
      setResult(error instanceof Error ? error.message : String(error));
    }
  };

  useEffect(() => {
    void load();
  }, []);

  return (
    <div>
      <p>{result}</p>
      <button onClick={load}>Reload stages</button>
      <button
        onClick={async () => {
          try {
            await new MetadataApiClient().mutation({});
          } catch (error) {
            setResult(error instanceof Error ? error.message : String(error));
          }
        }}
      >
        Try mutation
      </button>
    </div>
  );
};

export default defineFrontComponent({
  universalIdentifier: 'cd35ed5e-1cb4-4430-a8f8-596d891c3e5e',
  name: 'metadata-preview',
  description: 'Reads dynamic field options in a component preview',
  component: MetadataPreview,
});
