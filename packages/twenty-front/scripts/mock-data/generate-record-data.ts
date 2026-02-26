/* eslint-disable no-console */
import * as fs from 'fs';
import * as path from 'path';

import { GENERATED_DIR, graphqlRequest, writeGeneratedFile } from './utils.js';

const RECORDS_LIMIT = 10;

type MetadataField = {
  type: string;
  name: string;
  relation?: { type: string } | null;
  settings?: { relationType?: string } | null;
};

type MetadataObject = {
  nameSingular: string;
  namePlural: string;
  fieldsList: MetadataField[];
};

const COMPOSITE_SELECTIONS: Record<string, string> = {
  LINKS: '{ __typename primaryLinkUrl primaryLinkLabel secondaryLinks }',
  ADDRESS:
    '{ __typename addressStreet1 addressStreet2 addressCity addressState addressCountry addressPostcode addressLat addressLng }',
  CURRENCY: '{ __typename amountMicros currencyCode }',
  FULL_NAME: '{ __typename firstName lastName }',
  EMAILS: '{ __typename primaryEmail additionalEmails }',
  PHONES:
    '{ __typename primaryPhoneNumber primaryPhoneCountryCode primaryPhoneCallingCode additionalPhones }',
  ACTOR: '{ __typename source workspaceMemberId name context }',
  RICH_TEXT_V2: '{ __typename blocknote markdown }',
};

const buildFieldSelection = (field: MetadataField): string | null => {
  if (field.type in COMPOSITE_SELECTIONS) {
    return `${field.name} ${COMPOSITE_SELECTIONS[field.type]}`;
  }

  if (field.type === 'RELATION') {
    if (!field.relation) return null;

    if (field.relation.type === 'ONE_TO_MANY') {
      return `${field.name} { __typename edges { __typename node { __typename id } } totalCount }`;
    }

    return `${field.name} { __typename id }`;
  }

  if (field.type === 'MORPH_RELATION') {
    return null;
  }

  return field.name;
};

const buildFindManyQuery = (
  object: MetadataObject,
  limit: number,
): string => {
  const selections = object.fieldsList
    .map(buildFieldSelection)
    .filter(Boolean)
    .join('\n            ');

  const capitalName =
    object.namePlural.charAt(0).toUpperCase() + object.namePlural.slice(1);

  return `
    query FindMany${capitalName} {
      ${object.namePlural}(first: ${limit}) {
        __typename
        edges {
          __typename
          node {
            __typename
            ${selections}
          }
          cursor
        }
        pageInfo {
          __typename
          hasNextPage
          hasPreviousPage
          startCursor
          endCursor
        }
        totalCount
      }
    }
  `;
};

const loadMetadata = (): {
  objects: { edges: { node: MetadataObject }[] };
} => {
  const metadataPath = path.join(
    GENERATED_DIR,
    'metadata/objects/mock-objects-metadata.ts',
  );

  if (!fs.existsSync(metadataPath)) {
    throw new Error(
      `Metadata file not found at ${metadataPath}.\n` +
        'Run generate-metadata first.',
    );
  }

  const raw = fs.readFileSync(metadataPath, 'utf-8');

  const jsonMatch = raw.match(
    /export const \w+:\s*\w+\s*=\s*\n([\s\S]+);[\s]*$/,
  );

  if (!jsonMatch) {
    throw new Error('Could not parse metadata file');
  }

  return JSON.parse(jsonMatch[1]);
};

const fetchObjectRecords = async ({
  token,
  objectMetadata,
}: {
  token: string;
  objectMetadata: MetadataObject;
}) => {
  const query = buildFindManyQuery(objectMetadata, RECORDS_LIMIT);

  console.log(
    `Fetching ${objectMetadata.namePlural} (limit: ${RECORDS_LIMIT}) from /graphql ...`,
  );

  const data = (await graphqlRequest('/graphql', query, token)) as Record<
    string,
    { edges: { node: Record<string, unknown> }[] }
  >;

  const records = data[objectMetadata.namePlural].edges.map(
    (edge) => edge.node,
  );

  console.log(`  Got ${records.length} ${objectMetadata.namePlural}.`);
  return records;
};

export const generateRecordData = async (token: string) => {
  const metadata = loadMetadata();

  const companyObject = metadata.objects.edges.find(
    (edge) => edge.node.nameSingular === 'company',
  )?.node;

  if (!companyObject) {
    throw new Error('Company object metadata not found');
  }

  const companyRecords = await fetchObjectRecords({
    token,
    objectMetadata: companyObject,
  });

  writeGeneratedFile(
    'data/companies/mock-companies-data.ts',
    'mockedCompanyRecords',
    'Record<string, unknown>[]',
    '',
    companyRecords,
  );
};
