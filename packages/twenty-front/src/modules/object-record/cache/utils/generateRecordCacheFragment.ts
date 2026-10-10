import { type DocumentNode, parse } from 'graphql';

import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { mapObjectMetadataToGraphQLQuery } from '@/object-metadata/utils/mapObjectMetadataToGraphQLQuery';
import {
  type ObjectPermissions,
  type RecordGqlFields,
} from 'twenty-shared/types';
import { capitalize, isDefined } from 'twenty-shared/utils';

type GenerateRecordCacheFragmentArgs = {
  objectMetadataItems: EnrichedObjectMetadataItem[];
  objectMetadataItem: Pick<
    EnrichedObjectMetadataItem,
    'fields' | 'nameSingular' | 'id' | 'readableFields'
  >;
  recordGqlFields?: RecordGqlFields;
  computeReferences?: boolean;
  objectPermissionsByObjectMetadataId: Record<
    string,
    ObjectPermissions & { objectMetadataId: string }
  >;
};

// Same source, same document: Apollo memoizes document transforms by identity
const recordCacheFragmentBySource = new Map<string, DocumentNode>();

// Parsed with graphql instead of gql: the selection varies with the requested
// fields under a fixed fragment name, which graphql-tag's global fragment
// registry reports as a duplicate fragment name
export const generateRecordCacheFragment = ({
  objectMetadataItems,
  objectMetadataItem,
  recordGqlFields,
  computeReferences = false,
  objectPermissionsByObjectMetadataId,
}: GenerateRecordCacheFragmentArgs): DocumentNode => {
  const capitalizedObjectName = capitalize(objectMetadataItem.nameSingular);

  const fragmentSource = `fragment ${capitalizedObjectName}Fragment on ${capitalizedObjectName} ${mapObjectMetadataToGraphQLQuery(
    {
      objectMetadataItems,
      objectMetadataItem,
      computeReferences,
      recordGqlFields,
      objectPermissionsByObjectMetadataId,
    },
  )}`;

  const cachedFragment = recordCacheFragmentBySource.get(fragmentSource);

  if (isDefined(cachedFragment)) {
    return cachedFragment;
  }

  const fragment = parse(fragmentSource);

  recordCacheFragmentBySource.set(fragmentSource, fragment);

  return fragment;
};
