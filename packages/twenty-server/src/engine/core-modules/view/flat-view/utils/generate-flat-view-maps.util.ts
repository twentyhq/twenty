import { type ViewEntity } from 'src/engine/core-modules/view/entities/view.entity';
import { type FlatViewMaps } from 'src/engine/core-modules/view/flat-view/types/flat-view-maps.type';
import { type FlatView } from 'src/engine/core-modules/view/flat-view/types/flat-view.type';

export const generateFlatViewMaps = (
  viewCollection: ViewEntity[],
): FlatViewMaps => {
  const flatViewMaps: FlatViewMaps = {
    byId: {},
    idByUniversalIdentifier: {},
  };

  for (const view of viewCollection) {
    const processedFlatView: FlatView = {
      ...view,
      viewFieldIds: view.viewFields?.map((viewField) => viewField.id) ?? [],
      universalIdentifier: view.universalIdentifier ?? view.id, // TODO: should not fallback to id, to remove once we have universalIdentifier required
    };

    flatViewMaps.byId[view.id] = processedFlatView;
    flatViewMaps.idByUniversalIdentifier[
      processedFlatView.universalIdentifier
    ] = view.id;
  }

  return flatViewMaps;
};
