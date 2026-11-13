import { createAtomSelector } from '@/ui/utilities/state/jotai/utils/createAtomSelector';
import { viewsSelector } from '@/views/states/selectors/viewsSelector';
import { type ViewWithRelations } from '@/views/types/ViewWithRelations';
import { isDefined } from 'twenty-shared/utils';

export const scopeViewsByScopedViewFieldIdMapSelector = createAtomSelector<
  Map<string, ViewWithRelations>
>({
  key: 'scopeViewsByScopedViewFieldIdMapSelector',
  get: ({ get }) =>
    new Map(
      get(viewsSelector).flatMap((view) =>
        isDefined(view.scopedViewFieldId)
          ? [[view.scopedViewFieldId, view] as const]
          : [],
      ),
    ),
});
