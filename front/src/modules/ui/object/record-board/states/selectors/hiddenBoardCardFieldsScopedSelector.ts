import { createScopedSelector } from '@/ui/utilities/recoil-scope/utils/createScopedSelector';

import { availableBoardCardFieldsScopedState } from '../availableBoardCardFieldsScopedState';
import { boardCardFieldsScopedState } from '../boardCardFieldsScopedState';

export const hiddenBoardCardFieldsScopedSelector = createScopedSelector({
  key: 'hiddenBoardCardFieldsScopedSelector',
  get:
    ({ scopeId }) =>
    ({ get }) => {
      const fields = get(boardCardFieldsScopedState({ scopeId }));
      const fieldKeys = fields.map(({ fieldMetadataId }) => fieldMetadataId);
      const otherAvailableKeys = get(
        availableBoardCardFieldsScopedState({ scopeId }),
      ).filter(({ fieldMetadataId }) => !fieldKeys.includes(fieldMetadataId));

      return [
        ...fields.filter((field) => !field.isVisible),
        ...otherAvailableKeys,
      ];
    },
});
