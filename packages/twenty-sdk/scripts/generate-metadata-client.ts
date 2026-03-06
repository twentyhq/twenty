import { readFile } from 'node:fs/promises';
import path from 'path';

import { CLIENTS_GENERATED_DIR } from '@/cli/constants/clients-dir';
import { ClientService } from '@/cli/utilities/client/client-service';

const TEMPLATE_PATH = path.resolve(
  __dirname,
  '..',
  'src',
  'cli',
  'utilities',
  'client',
  'twenty-client-template.ts',
);

const main = async () => {
  const outputPath = path.resolve(
    __dirname,
    '..',
    CLIENTS_GENERATED_DIR,
    'metadata',
  );

  const serverUrl = process.env.TWENTY_API_URL ?? 'http://localhost:3000';
  const token = process.env.TWENTY_API_KEY;
  const clientWrapperTemplateSource = await readFile(TEMPLATE_PATH, 'utf-8');

  const clientService = new ClientService({
    clientWrapperTemplateSource,
    serverUrl,
    token,
  });

  await clientService.generateMetadataClient({ outputPath });

  console.log(`Metadata client generated at ${outputPath}`);
};

main().catch((error) => {
  console.error('Failed to generate metadata client:', error);
  process.exit(1);
});
