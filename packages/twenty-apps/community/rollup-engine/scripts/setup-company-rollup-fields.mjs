import { config as loadEnv } from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envCandidates = [
  process.env.TWENTY_ENV_PATH ? path.resolve(process.env.TWENTY_ENV_PATH) : null,
  path.resolve(__dirname, '..', '.env'),
  path.resolve(__dirname, '..', '..', '..', '..', '..', '.env'),
].filter(Boolean);

envCandidates.forEach((candidate) => {
  if (!candidate) {
    return;
  }
  const result = loadEnv({ path: candidate });
  if (!result.error && process.env.TWENTY_API_KEY) {
    return;
  }
});

const METADATA_BASE_URL = (
  process.env.TWENTY_METADATA_BASE_URL ??
  (process.env.TWENTY_API_BASE_URL
    ? `${process.env.TWENTY_API_BASE_URL.replace(/\/+$/, '')}/metadata`
    : null) ??
  'http://localhost:3000/rest/metadata'
).replace(/\/+$/, '');

const API_KEY = process.env.TWENTY_API_KEY;

if (!API_KEY) {
  console.error('TWENTY_API_KEY is required in the environment to call the Metadata API.');
  process.exit(1);
}

const COMPANY_ROLLUP_FIELDS = [
  { name: 'totalPipelineAmount', label: 'Total Pipeline Amount', type: 'CURRENCY' },
  { name: 'totalOpportunityCount', label: 'Total Opportunity Count', type: 'NUMBER' },
  { name: 'wonPipelineAmount', label: 'Won Pipeline Amount', type: 'CURRENCY' },
  { name: 'wonOpportunityCount', label: 'Won Opportunity Count', type: 'NUMBER' },
  { name: 'openPipelineAmount', label: 'Open Pipeline Amount', type: 'CURRENCY' },
  { name: 'openOpportunityCount', label: 'Open Opportunity Count', type: 'NUMBER' },
  { name: 'lastOpportunityCloseDate', label: 'Last Opportunity Close Date', type: 'DATE' },
];

const metadataRequest = async (method, endpoint, body) => {
  const url = `${METADATA_BASE_URL}${endpoint}`;
  const headers = {
    Authorization: `Bearer ${API_KEY}`,
  };
  const init = { method, headers };
  if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
    init.body = JSON.stringify(body);
  }

  const response = await fetch(url, init);
  const text = await response.text();
  let parsed = {};
  if (text) {
    try {
      parsed = JSON.parse(text);
    } catch (error) {
      throw new Error(`Failed to parse JSON response from ${url}: ${text}`);
    }
  }

  if (!response.ok) {
    const messages = parsed?.messages || parsed?.message;
    const error = new Error(
      `Metadata API ${method} ${endpoint} failed: ${messages || response.statusText}`,
    );
    error.response = parsed;
    throw error;
  }

  return parsed;
};

const findObjectId = async (nameSingular) => {
  const response = await metadataRequest('GET', '/objects');
  const objects =
    (response?.data && Array.isArray(response.data.objects) ? response.data.objects : []) || [];
  const match = objects.find((entry) => entry.nameSingular === nameSingular);
  if (!match) {
    throw new Error(`Unable to find object with nameSingular="${nameSingular}" via Metadata API`);
  }
  return match.id;
};

const createField = async (objectMetadataId, field) => {
  try {
    const payload = {
      objectMetadataId,
      name: field.name,
      label: field.label,
      type: field.type,
    };
    await metadataRequest('POST', '/fields', payload);
    console.log(`✔ Created ${field.name}`);
  } catch (error) {
    const messages = error.response?.messages;
    const messageList = Array.isArray(messages)
      ? messages
      : typeof messages === 'string'
        ? [messages]
        : [];
    if (messageList.some((msg) => msg.includes('already exists'))) {
      console.log(`→ ${field.name} already exists; skipping`);
      return;
    }
    throw error;
  }
};

const main = async () => {
  console.log(`Using metadata base URL: ${METADATA_BASE_URL}`);
  const companyObjectId = await findObjectId('company');

  for (const field of COMPANY_ROLLUP_FIELDS) {
    // Metadata API prefers camelCase names; script assumes labels may contain spaces.
    await createField(companyObjectId, field);
  }

  console.log('Company rollup fields ensured.');
};

main().catch((error) => {
  console.error('Failed to provision rollup fields via Metadata API.');
  console.error(error instanceof Error ? error.message : error);
  if (error instanceof Error && error.stack) {
    console.error(error.stack);
  }
  process.exit(1);
});
