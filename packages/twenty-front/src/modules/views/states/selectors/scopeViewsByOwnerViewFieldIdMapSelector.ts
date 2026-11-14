import { createAtomSelector } from '@/ui/utilities/state/jotai/utils/createAtomSelector';
import { viewsSelector } from '@/views/states/selectors/viewsSelector';
import { type ViewWithRelations } from '@/views/types/ViewWithRelations';
import { isDefined } from 'twenty-shared/utils';

export const scopeViewsByOwnerViewFieldIdMapSelector = createAtomSelector<
  Map<string, ViewWithRelations>
>({
  key: 'scopeViewsByOwnerViewFieldIdMapSelector',
  get: ({ get }) =>
    new Map(
      get(viewsSelector).flatMap((view) =>
        isDefined(view.ownerViewFieldId)
          ? [[view.ownerViewFieldId, view] as const]
          : [],
      ),
    ),
});
