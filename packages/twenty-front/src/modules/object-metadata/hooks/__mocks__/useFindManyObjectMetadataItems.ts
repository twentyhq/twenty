import { FIND_MANY_OBJECT_METADATA_ITEMS } from '@/object-metadata/graphql/queries';
import { mockedStandardObjectMetadataQueryResult } from '~/testing/mock-data/generated/metadata/objects/mock-objects-metadata';

export const query = FIND_MANY_OBJECT_METADATA_ITEMS;

export const responseData = mockedStandardObjectMetadataQueryResult;
