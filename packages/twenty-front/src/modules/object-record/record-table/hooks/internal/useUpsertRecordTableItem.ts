import { useRecoilCallback } from 'recoil';

import { entityFieldsFamilyState } from '@/object-record/field/states/entityFieldsFamilyState';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

// TODO: refactor with scoped state later
export const useUpsertRecordTableItem = () => {
  return useRecoilCallback(
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
};
