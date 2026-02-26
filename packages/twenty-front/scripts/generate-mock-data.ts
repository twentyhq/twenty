/* eslint-disable no-console */
import { generateMetadata } from './mock-data/generate-metadata.js';
import { generateRecordData } from './mock-data/generate-record-data.js';
import { authenticate } from './mock-data/utils.js';

const main = async () => {
  const token = await authenticate();

  const metadata = await generateMetadata(token);
  await generateRecordData(token, metadata);

  console.log('All mock data generated!');
};

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
