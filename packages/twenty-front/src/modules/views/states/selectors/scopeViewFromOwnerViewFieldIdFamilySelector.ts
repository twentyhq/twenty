import { createAtomFamilySelector } from '@/ui/utilities/state/jotai/utils/createAtomFamilySelector';
import { scopeViewsByOwnerViewFieldIdMapSelector } from '@/views/states/selectors/scopeViewsByOwnerViewFieldIdMapSelector';
import { type ViewWithRelations } from '@/views/types/ViewWithRelations';

export const scopeViewFromOwnerViewFieldIdFamilySelector =
  createAtomFamilySelector<
    ViewWithRelations | undefined,
    { ownerViewFieldId: string }
  >({
    key: 'scopeViewFromOwnerViewFieldIdFamilySelector',
    get:
      ({ ownerViewFieldId }) =>
      ({ get }) =>
        get(scopeViewsByOwnerViewFieldIdMapSelector).get(ownerViewFieldId),
  });
