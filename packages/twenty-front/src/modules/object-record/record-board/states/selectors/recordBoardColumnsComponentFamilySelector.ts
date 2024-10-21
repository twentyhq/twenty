import { recordBoardColumnsComponentFamilyState } from '@/object-record/record-board/states/recordBoardColumnsComponentFamilyState';
import { createComponentFamilySelector } from '@/ui/utilities/state/component-state/utils/createComponentFamilySelector';
import { RecordGroupDefinition } from '@/object-record/record-group/types/RecordGroupDefinition';

export const recordBoardColumnsComponentFamilySelector =
  createComponentFamilySelector<RecordGroupDefinition | undefined, string>({
    key: 'recordBoardColumnsComponentFamilySelector',
    get:
      ({
        scopeId,
        familyKey: columnId,
      }: {
        scopeId: string;
        familyKey: string;
      }) =>
      ({ get }) => {
        return get(
          recordBoardColumnsComponentFamilyState({
            scopeId,
            familyKey: columnId,
          }),
        );
      },
    set:
      ({
        scopeId,
        familyKey: columnId,
      }: {
        scopeId: string;
        familyKey: string;
      }) =>
      ({ set }, newColumn) => {
        set(
          recordBoardColumnsComponentFamilyState({
            scopeId,
            familyKey: columnId,
          }),
          newColumn,
        );
      },
  });
