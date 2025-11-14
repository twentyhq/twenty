import { generate } from '@genql/cli';
import path from 'path';
import { fetchGraphQLSchema } from './fetch-graphql-schema';

type GenerateClientOptions = {
  url: string;
  graphqlEndpoint: 'metadata' | 'core';
  token: string;
  outputPath: string;
};

export const generateClient = async ({
  url,
  token,
  graphqlEndpoint,
  outputPath,
}: GenerateClientOptions): Promise<void> => {
  const schema = await fetchGraphQLSchema({ url, graphqlEndpoint, token });
  await generate({
    schema,
    output: path.resolve(outputPath),
    scalarTypes: {
      DateTime: 'string',
      JSON: 'Record<string, unknown>',
      UUID: 'string',
    },
    verbose: true,
  });
};
