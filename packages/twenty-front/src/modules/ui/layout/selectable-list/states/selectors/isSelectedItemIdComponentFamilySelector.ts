import { SelectableListComponentInstanceContext } from '@/ui/layout/selectable-list/states/contexts/SelectableListComponentInstanceContext';
import { isSelectedItemIdComponentFamilyState } from '@/ui/layout/selectable-list/states/isSelectedItemIdComponentFamilyState';
import { createComponentFamilySelector } from '@/ui/utilities/state/component-state/utils/createComponentFamilySelector';

export const isSelectedItemIdComponentFamilySelector =
  createComponentFamilySelector<boolean, string>({
    key: 'isSelectedItemIdComponentFamilySelector',
    componentInstanceContext: SelectableListComponentInstanceContext,
    get:
      ({ instanceId, familyKey }: { instanceId: string; familyKey: string }) =>
      ({ get }) =>
        get(
          isSelectedItemIdComponentFamilyState.atomFamily({
            instanceId: instanceId,
            familyKey: familyKey,
          }),
        ),
    set:
      ({ instanceId, familyKey }: { instanceId: string; familyKey: string }) =>
      ({ set }, newValue) =>
        set(
          isSelectedItemIdComponentFamilyState.atomFamily({
            instanceId: instanceId,
            familyKey: familyKey,
          }),
          newValue,
        ),
  });
