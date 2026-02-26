/* eslint-disable no-console */
import { print } from 'graphql';

import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { generateDepthRecordGqlFieldsFromObject } from '@/object-record/graphql/record-gql-fields/utils/generateDepthRecordGqlFieldsFromObject';
import { generateFindManyRecordsQuery } from '@/object-record/utils/generateFindManyRecordsQuery';

import { graphqlRequest, writeGeneratedFile } from './utils.js';

const RECORDS_LIMIT = 10;

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

export const generateRecordData = async (
  token: string,
  rawMetadata: { objects: { edges: { node: Record<string, unknown> }[] } },
) => {
  const objectMetadataItems = toObjectMetadataItems(rawMetadata);

  const companyObject = objectMetadataItems.find(
    (item) => item.nameSingular === 'company',
  );

  if (!companyObject) {
    throw new Error('Company object metadata not found');
  }

  const recordGqlFields = generateDepthRecordGqlFieldsFromObject({
    objectMetadataItems,
    objectMetadataItem: companyObject,
    depth: 1,
  });

  const queryDocument = generateFindManyRecordsQuery({
    objectMetadataItem: companyObject,
    objectMetadataItems,
    recordGqlFields,
    objectPermissionsByObjectMetadataId: {},
  });

  const query = addTypenamesToSelections(print(queryDocument));

  console.log(
    `Fetching ${companyObject.namePlural} (limit: ${RECORDS_LIMIT}) from /graphql ...`,
  );

  const data = (await graphqlRequest('/graphql', query, token, {
    limit: RECORDS_LIMIT,
  })) as Record<string, { edges: { node: Record<string, unknown> }[] }>;

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
