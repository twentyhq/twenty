import { type ObjectRecord } from 'twenty-shared/types';
import { fastDeepEqual } from 'twenty-shared/utils';

import { type BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';

export const objectRecordChangedProperties = <
  PRecord extends Partial<ObjectRecord | BaseWorkspaceEntity> =
    Partial<ObjectRecord>,
>(
  oldRecord: PRecord,
  newRecord: PRecord,
) => {
  const changedProperties = Object.keys(newRecord).filter(
    (key) =>
      !fastDeepEqual(Reflect.get(oldRecord, key), Reflect.get(newRecord, key)),
  );

  return changedProperties;
};
