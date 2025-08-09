import deepEqual from 'deep-equal';

import { type ObjectRecord } from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';

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
    (key) => !deepEqual(oldRecord[key], newRecord[key]),
  );

  return changedProperties;
};
