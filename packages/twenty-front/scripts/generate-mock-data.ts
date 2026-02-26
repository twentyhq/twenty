/* eslint-disable no-console */

// Orchestrator: authenticates once, then generates metadata and record data.
// Each generator can also be imported and called independently with a token.

import { authenticate } from './mock-data/utils.js';
import { generateMetadata } from './mock-data/generate-metadata.js';
import { generateRecordData } from './mock-data/generate-record-data.js';

const main = async () => {
  const token = await authenticate();

  await generateMetadata(token);

  // Record data depends on the metadata file written above
  await generateRecordData(token);

  console.log('All mock data generated!');
};

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
