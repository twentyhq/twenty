/* eslint-disable no-console, lingui/no-unlocalized-strings */
import { print } from 'graphql';

import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { generateDepthRecordGqlFieldsFromObject } from '@/object-record/graphql/record-gql-fields/utils/generateDepthRecordGqlFieldsFromObject';
import { generateFindManyRecordsQuery } from '@/object-record/utils/generateFindManyRecordsQuery';

import { graphqlRequest, writeGeneratedFile } from './utils.js';

const RECORDS_LIMIT = 10;

const OBJECTS_TO_GENERATE = [
  'company',
  'person',
  'task',
  'note',
  'timelineActivity',
  'workspaceMember',
  'favorite',
  'favoriteFolder',
  'connectedAccount',
  'calendarEvent',
];

// Production query builders omit __typename on connection/edge wrappers
// since Apollo Client injects them automatically. Raw fetch needs them explicit.
const addTypenamesToSelections = (query: string): string =>
  query.replace(/\{(?!\s*__typename\b)/g, '{\n__typename');

const toObjectMetadataItems = (rawMetadata: {
  objects: { edges: { node: Record<string, unknown> }[] };
}): ObjectMetadataItem[] =>
  rawMetadata.objects.edges.map((edge) => {
    const { fieldsList, indexMetadataList, ...rest } = edge.node;

    return {
      ...rest,
      fields: fieldsList,
      readableFields: fieldsList,
      updatableFields: fieldsList,
      indexMetadatas: ((indexMetadataList as unknown[]) ?? []).map(
        (index: any) => ({
          ...index,
          indexFieldMetadatas: index.indexFieldMetadataList ?? [],
        }),
      ),
    } as unknown as ObjectMetadataItem;
  });

const generateForObject = async (
  token: string,
  objectMetadataItems: ObjectMetadataItem[],
  objectNameSingular: string,
) => {
  const objectMetadataItem = objectMetadataItems.find(
    (item) => item.nameSingular === objectNameSingular,
  );

  if (!objectMetadataItem) {
    throw new Error(`${objectNameSingular} object metadata not found`);
  }

  const recordGqlFields = generateDepthRecordGqlFieldsFromObject({
    objectMetadataItems,
    objectMetadataItem,
    depth: 1,
  });

  const queryDocument = generateFindManyRecordsQuery({
    objectMetadataItem,
    objectMetadataItems,
    recordGqlFields,
    objectPermissionsByObjectMetadataId: {},
  });

  const query = addTypenamesToSelections(print(queryDocument));

  console.log(
    `Fetching ${objectMetadataItem.namePlural} (limit: ${RECORDS_LIMIT}) from /graphql ...`,
  );

  const data = (await graphqlRequest('/graphql', query, token, {
    limit: RECORDS_LIMIT,
  })) as Record<string, { edges: { node: Record<string, unknown> }[] }>;

  const records = data[objectMetadataItem.namePlural].edges.map(
    (edge) => edge.node,
  );

  console.log(`  Got ${records.length} ${objectMetadataItem.namePlural}.`);

  const pascalName =
    objectNameSingular.charAt(0).toUpperCase() + objectNameSingular.slice(1);

  writeGeneratedFile(
    `data/${objectMetadataItem.namePlural}/mock-${objectMetadataItem.namePlural}-data.ts`,
    `mocked${pascalName}Records`,
    'ObjectRecord[]',
    "import { type ObjectRecord } from '@/object-record/types/ObjectRecord';",
    records,
  );
};

export const generateRecordData = async (
  token: string,
  rawMetadata: { objects: { edges: { node: Record<string, unknown> }[] } },
) => {
  const objectMetadataItems = toObjectMetadataItems(rawMetadata);

  for (const objectNameSingular of OBJECTS_TO_GENERATE) {
    await generateForObject(token, objectMetadataItems, objectNameSingular);
  }
};
