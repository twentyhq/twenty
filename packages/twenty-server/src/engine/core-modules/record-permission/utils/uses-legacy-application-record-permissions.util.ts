import { MetadataReadability, MetadataWritability } from 'twenty-shared/types';

import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type OperationType } from 'src/engine/twenty-orm/repository/permissions.utils';
import { type RowAccessPolicySubject } from 'src/engine/twenty-orm/types/row-access-policy.type';

// Preserve the existing owning-application gate until install-time application permissions are redesigned.
export const usesLegacyApplicationRecordPermissions = ({
  subject,
  object,
  operationType,
}: {
  subject: RowAccessPolicySubject;
  object: FlatObjectMetadata;
  operationType: OperationType;
}): boolean =>
  subject.isOwningApplication(object) &&
  (operationType === 'select'
    ? object.readability === MetadataReadability.APPLICATION
    : object.writability === MetadataWritability.APPLICATION);
