import { metadataStoreState } from '@/metadata-store/states/metadataStoreState';
import { type FlatObjectMetadataItem } from '@/metadata-store/types/FlatObjectMetadataItem';
import { type FlatView } from '@/metadata-store/types/FlatView';
import { createAtomSelector } from '@/ui/utilities/state/jotai/utils/createAtomSelector';
import { type ViewSummary } from '@/views/types/ViewSummary';
import { resolveViewNamePlaceholders } from '@/views/utils/resolveViewNamePlaceholders';

export const viewSummariesSelector = createAtomSelector<ViewSummary[]>({
  key: 'viewSummariesSelector',
  get: ({ get }) => {
    const flatViews = get(metadataStoreState, 'views').current as FlatView[];
    const flatObjectMetadataItems = get(
      metadataStoreState,
      'objectMetadataItems',
    ).current as FlatObjectMetadataItem[];

    const objectMetadataItemsById = new Map(
      flatObjectMetadataItems.map((item) => [item.id, item]),
    );

    return flatViews
      .filter((view) => view.isActive)
      .map((view) => ({
        id: view.id,
        universalIdentifier: view.universalIdentifier,
        name: resolveViewNamePlaceholders(
          view.name,
          objectMetadataItemsById.get(view.objectMetadataId),
        ),
        icon: view.icon,
        type: view.type,
        key: view.key,
        objectMetadataId: view.objectMetadataId,
        position: view.position,
        isPrivate: view.isPrivate,
        isActive: view.isActive,
      }));
  },
});
