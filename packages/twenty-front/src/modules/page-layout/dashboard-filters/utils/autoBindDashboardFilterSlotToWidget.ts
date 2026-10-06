import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { isManyToOneRelationField } from '@/object-metadata/utils/isManyToOneRelationField';
import { findManyToOneRelationFieldTargetingObject } from '@/page-layout/dashboard-filters/utils/findManyToOneRelationFieldTargetingObject';
import { getDashboardFilterFieldDimensionKey } from '@/page-layout/dashboard-filters/utils/getDashboardFilterFieldDimensionKey';
import { getWidgetDashboardFilterBindings } from '@/page-layout/dashboard-filters/utils/getWidgetDashboardFilterBindings';
import { isDashboardFilterCandidateField } from '@/page-layout/dashboard-filters/utils/isDashboardFilterCandidateField';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import {
  type DashboardFilterBinding,
  type DashboardFilterSlot,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { WidgetType } from '~/generated-metadata/graphql';

type AutoBindObjectMetadataItem = Pick<
  EnrichedObjectMetadataItem,
  'id' | 'fields'
>;

const translateBindingToObject = ({
  binding,
  objectMetadataItem,
  objectMetadataItems,
}: {
  binding: DashboardFilterBinding;
  objectMetadataItem: AutoBindObjectMetadataItem;
  objectMetadataItems: AutoBindObjectMetadataItem[];
}): DashboardFilterBinding | null => {
  const boundField = objectMetadataItems
    .flatMap(
      (candidateObjectMetadataItem) => candidateObjectMetadataItem.fields,
    )
    .find((field) => field.id === binding.fieldMetadataId);

  if (!isDefined(boundField)) {
    return null;
  }

  // A relation matches by target object whatever the field is called, so Company.accountOwner and Task.assignee both stand for the workspace member.
  if (isManyToOneRelationField(boundField)) {
    const relationField = findManyToOneRelationFieldTargetingObject({
      fields: objectMetadataItem.fields.filter(isDashboardFilterCandidateField),
      targetObjectMetadataId: boundField.relation.targetObjectMetadata.id,
    });

    if (!isDefined(relationField)) {
      return null;
    }

    return {
      fieldMetadataId: relationField.id,
      ...(isDefined(binding.relationTargetFieldMetadataId)
        ? {
            relationTargetFieldMetadataId:
              binding.relationTargetFieldMetadataId,
          }
        : {}),
    };
  }

  const boundFieldDimensionKey =
    getDashboardFilterFieldDimensionKey(boundField);

  const matchingField = objectMetadataItem.fields.find(
    (field) =>
      isDashboardFilterCandidateField(field) &&
      getDashboardFilterFieldDimensionKey(field) === boundFieldDimensionKey,
  );

  if (!isDefined(matchingField)) {
    return null;
  }

  return {
    fieldMetadataId: matchingField.id,
    ...(isDefined(binding.subFieldName)
      ? { subFieldName: binding.subFieldName }
      : {}),
  };
};

// A new chart follows how the other charts already bind the slot; the first chart with a translatable binding wins.
export const autoBindDashboardFilterSlotToWidget = ({
  slot,
  widgetObjectMetadataId,
  existingWidgets,
  objectMetadataItems,
}: {
  slot: Pick<DashboardFilterSlot, 'id'>;
  widgetObjectMetadataId: string | null | undefined;
  existingWidgets: PageLayoutWidget[];
  objectMetadataItems: AutoBindObjectMetadataItem[];
}): DashboardFilterBinding | null => {
  const objectMetadataItem = objectMetadataItems.find(
    (candidateObjectMetadataItem) =>
      candidateObjectMetadataItem.id === widgetObjectMetadataId,
  );

  if (!isDefined(objectMetadataItem)) {
    return null;
  }

  const existingBindings = existingWidgets
    .filter((widget) => widget.type === WidgetType.GRAPH)
    .map((widget) => getWidgetDashboardFilterBindings(widget)[slot.id])
    .filter(isDefined);

  for (const existingBinding of existingBindings) {
    const translatedBinding = translateBindingToObject({
      binding: existingBinding,
      objectMetadataItem,
      objectMetadataItems,
    });

    if (isDefined(translatedBinding)) {
      return translatedBinding;
    }
  }

  return null;
};
