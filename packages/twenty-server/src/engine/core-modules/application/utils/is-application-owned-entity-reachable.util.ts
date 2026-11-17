import { isDefined } from 'twenty-shared/utils';

import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { type SyncableFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-from.type';

// Unknown ids pass so the endpoint keeps answering NOT_FOUND
export const isApplicationOwnedEntityReachable = ({
  flatEntity,
  callingApplication,
}: {
  flatEntity: Pick<SyncableFlatEntity, 'applicationId'> | undefined;
  callingApplication: Pick<FlatApplication, 'id'>;
}): boolean =>
  !isDefined(flatEntity) || flatEntity.applicationId === callingApplication.id;
