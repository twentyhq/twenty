import deepEqual from 'deep-equal';
import { ObjectRecord } from 'twenty-shared';

import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';

export const objectRecordChangedProperties = <
  PRecord extends Partial<
    ObjectRecord | BaseWorkspaceEntity
  > = Partial<ObjectRecord>,
>(
  oldRecord: PRecord,
  newRecord: PRecord,
) => {
  const changedProperties = Object.keys(newRecord).filter(
    (key) => !deepEqual(oldRecord[key], newRecord[key]),
  );

  return changedProperties;
};
