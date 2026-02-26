/* eslint-disable no-console */
import * as fs from 'fs';
import * as path from 'path';

import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { mapObjectMetadataToGraphQLQuery } from '@/object-metadata/utils/mapObjectMetadataToGraphQLQuery';
import { generateDepthRecordGqlFieldsFromObject } from '@/object-record/graphql/record-gql-fields/utils/generateDepthRecordGqlFieldsFromObject';
import { capitalize } from 'twenty-shared/utils';

import { GENERATED_DIR, graphqlRequest, writeGeneratedFile } from './utils.js';

const RECORDS_LIMIT = 10;

// Production query builders omit __typename on connection/edge wrappers
// since Apollo Client injects them automatically. Raw fetch needs them explicit.
const addTypenamesToSelections = (query: string): string =>
  query.replace(/\{(?!\s*__typename\b)/g, '{\n__typename');

const loadObjectMetadataItems = (): ObjectMetadataItem[] => {
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

  const metadata = JSON.parse(jsonMatch[1]);

  return metadata.objects.edges.map(
    (edge: { node: Record<string, unknown> }) => {
      const { fieldsList, indexMetadataList, ...rest } = edge.node as Record<
        string,
        unknown
      >;

      const fields = fieldsList as unknown[];

      return {
        ...rest,
        fields,
        readableFields: fields,
        updatableFields: fields,
        indexMetadatas: ((indexMetadataList as unknown[]) ?? []).map(
          (index: any) => ({
            ...index,
            indexFieldMetadatas: index.indexFieldMetadataList ?? [],
          }),
        ),
      } as unknown as ObjectMetadataItem;
    },
  );
};

const buildFindManyQuery = (
  objectMetadataItem: ObjectMetadataItem,
  objectMetadataItems: ObjectMetadataItem[],
): string => {
  const recordGqlFields = generateDepthRecordGqlFieldsFromObject({
    objectMetadataItems,
    objectMetadataItem,
    depth: 1,
  });

  const fieldSelection = mapObjectMetadataToGraphQLQuery({
    objectMetadataItems,
    objectMetadataItem,
    recordGqlFields,
    objectPermissionsByObjectMetadataId: {},
  });

  return addTypenamesToSelections(`
    query FindMany${capitalize(objectMetadataItem.namePlural)} {
      ${objectMetadataItem.namePlural}(first: ${RECORDS_LIMIT}) {
        edges {
          node ${fieldSelection}
          cursor
        }
        pageInfo {
          hasNextPage
          hasPreviousPage
          startCursor
          endCursor
        }
        totalCount
      }
    }
  `);
};

export const generateRecordData = async (token: string) => {
  const objectMetadataItems = loadObjectMetadataItems();

  const companyObject = objectMetadataItems.find(
    (item) => item.nameSingular === 'company',
  );

  if (!companyObject) {
    throw new Error('Company object metadata not found');
  }

  const query = buildFindManyQuery(companyObject, objectMetadataItems);

  console.log(
    `Fetching ${companyObject.namePlural} (limit: ${RECORDS_LIMIT}) from /graphql ...`,
  );

  const data = (await graphqlRequest('/graphql', query, token)) as Record<
    string,
    { edges: { node: Record<string, unknown> }[] }
  >;

  const records = data[companyObject.namePlural].edges.map((edge) => edge.node);

  console.log(`  Got ${records.length} ${companyObject.namePlural}.`);

  writeGeneratedFile(
    'data/companies/mock-companies-data.ts',
    'mockedCompanyRecords',
    'Record<string, unknown>[]',
    '',
    records,
  );
};
