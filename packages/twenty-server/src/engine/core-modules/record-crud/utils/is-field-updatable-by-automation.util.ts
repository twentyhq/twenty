import {
  canObjectBeManagedByAutomation,
  isObjectSyncedFromConnectedAccounts,
} from 'twenty-shared/workflow';

import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { belongsToTwentyStandardApp } from 'src/engine/metadata-modules/utils/belongs-to-twenty-standard-app.util';

// The sync rewrites standard fields; other fields are left to roles and disabledFieldPermissionActions.
export const isFieldUpdatableByAutomation = ({
  flatObjectMetadata,
  flatFieldMetadata,
}: {
  flatObjectMetadata: Pick<FlatObjectMetadata, 'nameSingular'>;
  flatFieldMetadata: FlatFieldMetadata;
}): boolean =>
  canObjectBeManagedByAutomation({
    nameSingular: flatObjectMetadata.nameSingular,
  }) ||
  (isObjectSyncedFromConnectedAccounts({
    nameSingular: flatObjectMetadata.nameSingular,
  }) &&
    !belongsToTwentyStandardApp(flatFieldMetadata));
