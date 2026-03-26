import { isDefined } from 'twenty-shared/utils';
import { type CommandMenuItemFieldsFragment } from '~/generated-metadata/graphql';

export const matchesObjectMetadataId =
  (objectMetadataItemId: unknown) =>
  (item: CommandMenuItemFieldsFragment) =>
    !isDefined(item.availabilityObjectMetadataId) ||
    item.availabilityObjectMetadataId === objectMetadataItemId;
