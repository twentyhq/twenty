import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type CompleteGraphWidgetFieldSelection } from '@/page-layout/types/CompleteGraphWidgetFieldSelection';
import { getChartDefaultFieldSelection } from '@/page-layout/utils/getChartDefaultFieldSelection';
import { isGraphWidgetFieldSelectionComplete } from '@/page-layout/utils/isGraphWidgetFieldSelectionComplete';
import { StandardObjectNameSingular } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

const PREFERRED_CHART_OBJECT_NAMES_SINGULAR = [
  StandardObjectNameSingular.Opportunity,
  StandardObjectNameSingular.Company,
];

export const findDefaultChartFieldSelection = (
  objectMetadataItems: EnrichedObjectMetadataItem[],
): CompleteGraphWidgetFieldSelection | undefined => {
  const preferredObjectMetadataItems =
    PREFERRED_CHART_OBJECT_NAMES_SINGULAR.map((nameSingular) =>
      objectMetadataItems.find(
        (objectMetadataItem) =>
          objectMetadataItem.nameSingular === nameSingular,
      ),
    ).filter(isDefined);

  const otherObjectMetadataItems = objectMetadataItems
    .filter(
      (objectMetadataItem) =>
        !preferredObjectMetadataItems.includes(objectMetadataItem),
    )
    .toSorted((first, second) =>
      first.labelPlural.localeCompare(second.labelPlural),
    );

  return [...preferredObjectMetadataItems, ...otherObjectMetadataItems]
    .map(getChartDefaultFieldSelection)
    .find(isGraphWidgetFieldSelectionComplete);
};
