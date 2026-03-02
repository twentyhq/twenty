/* eslint-disable no-console */
import { generateApiKeys } from './mock-data/generate-api-keys.js';
import { generateBillingPlans } from './mock-data/generate-billing-plans.js';
import { generateMetadata } from './mock-data/generate-metadata.js';
import { generateRecordData } from './mock-data/generate-record-data.js';
import { generateRoles } from './mock-data/generate-roles.js';
import { generateViews } from './mock-data/generate-views.js';
import { authenticate } from './mock-data/utils.js';

const main = async () => {
  const token = await authenticate();

  const metadata = await generateMetadata(token);
  await generateRecordData(token, metadata);
  await generateRoles(token);
  await generateViews(token);

  try {
    await generateBillingPlans(token);
  } catch (error) {
    console.warn(
      'Skipping billing plans generation (billing not available):',
      (error as Error).message,
    );
  }

  try {
    await generateApiKeys(token);
  } catch (error) {
    console.warn('Skipping API keys generation:', (error as Error).message);
  }

  console.log('All mock data generated!');
};

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
