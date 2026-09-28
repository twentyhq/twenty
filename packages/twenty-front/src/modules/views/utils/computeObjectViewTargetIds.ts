import { type View } from '@/views/types/View';
import { ViewKey } from '@/views/types/ViewKey';
import { isWidgetViewType } from 'twenty-shared/utils';

export const computeObjectViewTargetIds = <
  TView extends Pick<
    View,
    'id' | 'objectMetadataId' | 'key' | 'type' | 'position'
  >,
>({
  views,
  objectMetadataId,
  isInitialObjectViewEnabled,
}: {
  views: TView[];
  objectMetadataId?: string;
  isInitialObjectViewEnabled: boolean;
}): {
  firstSelectableViewId?: string;
  indexViewId?: string;
  firstAvailableViewId?: string;
} => {
  const selectableViewsOnObject = views
    .filter(
      (view) =>
        view.objectMetadataId === objectMetadataId &&
        !isWidgetViewType(view.type),
    )
    .sort((a, b) => a.position - b.position || a.id.localeCompare(b.id));

  return {
    firstSelectableViewId: isInitialObjectViewEnabled
      ? selectableViewsOnObject.find((view) => view.key !== ViewKey.INDEX)?.id
      : undefined,
    indexViewId: selectableViewsOnObject.find(
      (view) => view.key === ViewKey.INDEX,
    )?.id,
    firstAvailableViewId: selectableViewsOnObject[0]?.id,
  };
};
