import { fetchGraphQLSchema } from '@/api/fetch-graphql-schema';
import { generate } from '@genql/cli';
import path from 'path';

type GenerateSdkOptions = {
  url: string;
  graphqlEndpoint: 'metadata' | 'core';
  token: string;
  outputPath?: string;
};

export const generateSdk = async ({
  url,
  token,
  graphqlEndpoint,
  outputPath = 'src/generated',
}: GenerateSdkOptions): Promise<void> => {
  try {
    console.log('Fetching GraphQL schema...');

    const schema = await fetchGraphQLSchema({ url, graphqlEndpoint, token });

    console.log('Generating SDK...');

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

    console.log(`✓ SDK generated successfully at ${outputPath}`);
  } catch (error) {
    console.error('Failed to generate SDK:', error);
    throw error;
  }
};
