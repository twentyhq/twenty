import { useRecoilCallback } from 'recoil';

import { entityFieldsFamilyState } from '@/object-record/field/states/entityFieldsFamilyState';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

export const useUpsertRecordTableItem = () =>
  useRecoilCallback(
    ({ set, snapshot }) =>
      <T extends { id: string }>(entity: T) => {
        const currentEntity = snapshot
          .getLoadable(entityFieldsFamilyState(entity.id))
          .valueOrThrow();

        if (!isDeeplyEqual(currentEntity, entity)) {
          set(entityFieldsFamilyState(entity.id), entity);
        }
      },
    [],
  );
