import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { getIntrospectionQuery, buildClientSchema, printSchema } from 'graphql';

import { generateMetadataClient } from '../src/generate/generate-metadata-client';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TEMPLATE_PATH = path.resolve(
  __dirname,
  '..',
  'src',
  'generate',
  'twenty-client-template.ts',
);

const introspectSchema = async (url: string): Promise<string> => {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: getIntrospectionQuery() }),
  });

  const json = await response.json();

  if (json.errors) {
    throw new Error(
      `GraphQL introspection errors: ${JSON.stringify(json.errors)}`,
    );
  }

  return printSchema(buildClientSchema(json.data));
};

const main = async () => {
  const serverUrl = process.env.TWENTY_API_URL ?? 'http://localhost:3000';

  const schema = await introspectSchema(`${serverUrl}/metadata`);

  const clientWrapperTemplateSource = await readFile(TEMPLATE_PATH, 'utf-8');

  const outputPath = path.resolve(
    __dirname,
    '..',
    'src',
    'metadata',
    'generated',
  );

  await generateMetadataClient({
    schema,
    outputPath,
    clientWrapperTemplateSource,
  });

  console.log(`Metadata client generated at ${outputPath}`);
};

main().catch((error) => {
  console.error('Failed to generate metadata client:', error);
  process.exit(1);
});
