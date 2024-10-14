import { createComponentFamilySelector } from '@/ui/utilities/state/component-state/utils/createComponentFamilySelector';
import {
  NewCard,
  recordBoardNewRecordByColumnIdComponentFamilyState,
} from '../recordBoardNewRecordByColumnIdComponentFamilyState';

export const recordBoardNewRecordByColumnIdSelector =
  createComponentFamilySelector<NewCard, string>({
    key: 'recordBoardNewRecordByColumnIdSelector',
    get:
      ({ familyKey, scopeId }: { familyKey: string; scopeId: string }) =>
      ({ get }) => {
        return get(
          recordBoardNewRecordByColumnIdComponentFamilyState({
            familyKey,
            scopeId,
          }),
        ) as NewCard;
      },
    set:
      ({ familyKey, scopeId }: { familyKey: string; scopeId: string }) =>
      ({ set }, newValue) => {
        set(
          recordBoardNewRecordByColumnIdComponentFamilyState({
            familyKey,
            scopeId,
          }),
          newValue as NewCard,
        );
      },
  });
