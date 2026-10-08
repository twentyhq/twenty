import { createAtomSelector } from '@/ui/utilities/state/jotai/utils/createAtomSelector';
import { viewsSelector } from '@/views/states/selectors/viewsSelector';
import { type ViewWithRelations } from '@/views/types/ViewWithRelations';

export const viewsByIdMapSelector = createAtomSelector<
  Map<string, ViewWithRelations>
>({
  key: 'viewsByIdMapSelector',
  get: ({ get }) => new Map(get(viewsSelector).map((view) => [view.id, view])),
});
