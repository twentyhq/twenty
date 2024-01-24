import { createSelectorScopeMap } from '@/ui/utilities/recoil-scope/utils/createSelectorScopeMap';

import { availableRecordBoardDeprecatedCardFieldsScopedState } from '../availableRecordBoardDeprecatedCardFieldsScopedState';
import { recordBoardCardFieldsScopedState } from '../recordBoardDeprecatedCardFieldsScopedState';

export const hiddenRecordBoardDeprecatedCardFieldsScopedSelector =
  createSelectorScopeMap({
    key: 'hiddenRecordBoardDeprecatedCardFieldsScopedSelector',
    get:
      ({ scopeId }) =>
      ({ get }) => {
        const fields = get(recordBoardCardFieldsScopedState({ scopeId }));
        const fieldKeys = fields.map(({ fieldMetadataId }) => fieldMetadataId);

        const otherAvailableKeys = get(
          availableRecordBoardDeprecatedCardFieldsScopedState({ scopeId }),
        ).filter(({ fieldMetadataId }) => !fieldKeys.includes(fieldMetadataId));

        return [
          ...fields.filter((field) => !field.isVisible),
          ...otherAvailableKeys,
        ];
      },
  });
