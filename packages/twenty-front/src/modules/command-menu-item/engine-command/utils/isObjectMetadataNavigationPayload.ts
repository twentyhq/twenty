import {
  type NavigationPayload,
  type ObjectMetadataNavigationPayload,
} from '~/generated-metadata/graphql';

export const isObjectMetadataNavigationPayload = (
  payload: NavigationPayload,
): payload is ObjectMetadataNavigationPayload =>
  'objectMetadataItemId' in payload &&
  typeof payload.objectMetadataItemId === 'string';
