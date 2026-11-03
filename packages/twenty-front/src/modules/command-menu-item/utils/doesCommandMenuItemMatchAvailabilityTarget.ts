import { type CommandMenuCoreObjectName } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { type CommandMenuItemFieldsFragment } from '~/generated-metadata/graphql';

export const doesCommandMenuItemMatchAvailabilityTarget =
  ({
    objectMetadataItemId,
    coreObjectName,
  }: {
    objectMetadataItemId: unknown;
    coreObjectName: CommandMenuCoreObjectName | null;
  }) =>
  (item: CommandMenuItemFieldsFragment) => {
    if (isDefined(item.availabilityCoreObjectName)) {
      return item.availabilityCoreObjectName === coreObjectName;
    }

    return (
      !isDefined(item.availabilityObjectMetadataId) ||
      item.availabilityObjectMetadataId === objectMetadataItemId
    );
  };
