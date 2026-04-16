import { type ObjectRecord } from 'twenty-shared/types';
import { fastDeepEqual } from 'twenty-shared/utils';

import { type BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';

export const objectRecordChangedProperties = <
  PRecord extends Partial<
    ObjectRecord | BaseWorkspaceEntity
  > = Partial<ObjectRecord>,
>(
  oldRecord: PRecord,
  newRecord: PRecord,
) => {
  const changedProperties = Object.keys(newRecord).filter(
    // @ts-expect-error legacy noImplicitAny
    (key) => !fastDeepEqual(oldRecord[key], newRecord[key]),
  );

  return changedProperties;
};
