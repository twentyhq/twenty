import * as path from 'path';
import { fileURLToPath } from 'url';

import { ClientService } from '../../src/cli/utilities/client/client-service';

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const PACKAGE_ROOT = path.resolve(SCRIPT_DIR, '../..');
const OUTPUT_DIR = path.join(PACKAGE_ROOT, 'src/clients/generated/metadata');

const main = async (): Promise<void> => {
  try {
    const clientService = new ClientService();

    await clientService.generateMetadataClient({ outputPath: OUTPUT_DIR });

    console.log(`Metadata client generated at ${OUTPUT_DIR}`);
  } catch (error) {
    console.error('Failed to generate metadata client:', error);
    process.exit(1);
  }
};

main();
