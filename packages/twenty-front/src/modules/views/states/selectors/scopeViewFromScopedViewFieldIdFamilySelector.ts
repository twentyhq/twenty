import { createAtomFamilySelector } from '@/ui/utilities/state/jotai/utils/createAtomFamilySelector';
import { scopeViewsByScopedViewFieldIdMapSelector } from '@/views/states/selectors/scopeViewsByScopedViewFieldIdMapSelector';
import { type ViewWithRelations } from '@/views/types/ViewWithRelations';

export const scopeViewFromScopedViewFieldIdFamilySelector =
  createAtomFamilySelector<
    ViewWithRelations | undefined,
    { scopedViewFieldId: string }
  >({
    key: 'scopeViewFromScopedViewFieldIdFamilySelector',
    get:
      ({ scopedViewFieldId }) =>
      ({ get }) =>
        get(scopeViewsByScopedViewFieldIdMapSelector).get(scopedViewFieldId),
    areEqual: (previous, next) => previous === next,
  });
