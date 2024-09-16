import deepEqual from 'deep-equal';

import { Record } from 'src/engine/api/graphql/workspace-query-builder/interfaces/record.interface';

import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';

export const objectRecordChangedProperties = <
  PRecord extends Partial<Record | BaseWorkspaceEntity> = Partial<Record>,
>(
  oldRecord: PRecord,
  newRecord: PRecord,
) => {
  const changedProperties = Object.keys(newRecord).filter(
    (key) => !deepEqual(oldRecord[key], newRecord[key]),
  );

  return changedProperties;
};
