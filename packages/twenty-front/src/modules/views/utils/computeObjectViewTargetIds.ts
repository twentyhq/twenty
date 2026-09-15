import { type View } from '@/views/types/View';
import { ViewKey } from '@/views/types/ViewKey';
import { ViewType } from '~/generated-metadata/graphql';

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
  initialObjectViewId?: string;
  indexViewId?: string;
  firstAvailableViewId?: string;
} => {
  const selectableViewsOnObject = views
    .filter(
      (view) =>
        view.objectMetadataId === objectMetadataId &&
        view.type !== ViewType.FIELDS_WIDGET,
    )
    .sort((a, b) => a.position - b.position || a.id.localeCompare(b.id));

  return {
    initialObjectViewId: isInitialObjectViewEnabled
      ? selectableViewsOnObject.find((view) => view.key !== ViewKey.INDEX)?.id
      : undefined,
    indexViewId: selectableViewsOnObject.find(
      (view) => view.key === ViewKey.INDEX,
    )?.id,
    firstAvailableViewId: selectableViewsOnObject[0]?.id,
  };
};
