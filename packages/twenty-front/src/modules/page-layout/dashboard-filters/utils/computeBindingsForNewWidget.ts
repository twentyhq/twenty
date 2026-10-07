import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { getFilterFilterableFieldMetadataItems } from '@/object-metadata/utils/getFilterFilterableFieldMetadataItems';
import { isManyToOneRelationField } from '@/object-metadata/utils/isManyToOneRelationField';
import { type DashboardFilterObjectMetadataItem } from '@/page-layout/dashboard-filters/types/DashboardFilterObjectMetadataItem';
import { computePersistedDashboardFilterBindings } from '@/page-layout/dashboard-filters/utils/computePersistedDashboardFilterBindings';
import { findPreferredRelationFieldToTarget } from '@/page-layout/dashboard-filters/utils/findPreferredRelationFieldToTarget';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import {
  type DashboardFilterBinding,
  type DashboardFilterSlot,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

const ID_FIELD_NAME = 'id';

type FieldWithOwner = {
  field: FieldMetadataItem;
  objectMetadataId: string;
};

export type ComputeBindingsForNewWidgetArgs = {
  widget: Pick<PageLayoutWidget, 'objectMetadataId'>;
  slots: DashboardFilterSlot[];
  existingWidgets: Pick<PageLayoutWidget, 'id' | 'type' | 'configuration'>[];
  objectMetadataItems: DashboardFilterObjectMetadataItem[];
  isJsonFilterEnabled?: boolean;
};

const getRelationTargetObjectMetadataId = (field: FieldMetadataItem) =>
  isManyToOneRelationField(field)
    ? field.relation.targetObjectMetadata.id
    : undefined;

// A binding through a target field (company -> name) only carries over when the new relation reaches the same object.
const buildMatchingBinding = ({
  existingBinding,
  existingField,
  matchingField,
}: {
  existingBinding: DashboardFilterBinding;
  existingField: FieldMetadataItem;
  matchingField: FieldMetadataItem;
}): DashboardFilterBinding => {
  const hasSameRelationTarget =
    isDefined(getRelationTargetObjectMetadataId(existingField)) &&
    getRelationTargetObjectMetadataId(existingField) ===
      getRelationTargetObjectMetadataId(matchingField);

  return {
    fieldMetadataId: matchingField.id,
    ...(isDefined(existingBinding.subFieldName)
      ? { subFieldName: existingBinding.subFieldName }
      : {}),
    ...(isDefined(existingBinding.relationTargetFieldMetadataId) &&
    hasSameRelationTarget
      ? {
          relationTargetFieldMetadataId:
            existingBinding.relationTargetFieldMetadataId,
        }
      : {}),
  };
};

// The slot carries no target; the first widget already bound to it tells which object a RELATION slot points at.
const findSlotRelationTargetObjectMetadataId = (
  existingFields: FieldWithOwner[],
) =>
  existingFields
    .map(({ field, objectMetadataId }) =>
      field.name === ID_FIELD_NAME
        ? objectMetadataId
        : getRelationTargetObjectMetadataId(field),
    )
    .find(isDefined);

export const computeBindingsForNewWidget = ({
  widget,
  slots,
  existingWidgets,
  objectMetadataItems,
  isJsonFilterEnabled = false,
}: ComputeBindingsForNewWidgetArgs): Record<
  string,
  DashboardFilterBinding | null
> => {
  const objectMetadataItem = objectMetadataItems.find(
    (item) => item.id === widget.objectMetadataId,
  );

  if (!isDefined(objectMetadataItem)) {
    return {};
  }

  const fieldById = new Map<string, FieldWithOwner>(
    objectMetadataItems.flatMap((item) =>
      item.fields.map((field): [string, FieldWithOwner] => [
        field.id,
        { field, objectMetadataId: item.id },
      ]),
    ),
  );

  const filterableFields = objectMetadataItem.fields.filter(
    getFilterFilterableFieldMetadataItems({ isJsonFilterEnabled }),
  );

  const existingBindingsByWidgetId = computePersistedDashboardFilterBindings({
    widgets: existingWidgets,
  });

  return Object.fromEntries(
    slots.map((slot): [string, DashboardFilterBinding | null] => {
      const existingBindings = Object.values(existingBindingsByWidgetId)
        .map((bindings) => bindings[slot.id])
        .filter(isDefined);

      for (const existingBinding of existingBindings) {
        const existingField = fieldById.get(existingBinding.fieldMetadataId);

        // Every object has an id; it only stands for the slot target, which the RELATION fallback checks.
        if (
          !isDefined(existingField) ||
          existingField.field.name === ID_FIELD_NAME
        ) {
          continue;
        }

        const matchingField = filterableFields.find(
          (field) =>
            field.name === existingField.field.name &&
            field.type === existingField.field.type,
        );

        if (isDefined(matchingField)) {
          return [
            slot.id,
            buildMatchingBinding({
              existingBinding,
              existingField: existingField.field,
              matchingField,
            }),
          ];
        }
      }

      if (slot.filterType !== 'RELATION') {
        return [slot.id, null];
      }

      const targetObjectMetadataId = findSlotRelationTargetObjectMetadataId(
        existingBindings
          .map((binding) => fieldById.get(binding.fieldMetadataId))
          .filter(isDefined),
      );

      if (!isDefined(targetObjectMetadataId)) {
        return [slot.id, null];
      }

      const boundField =
        objectMetadataItem.id === targetObjectMetadataId
          ? objectMetadataItem.fields.find(
              (field) =>
                field.name === ID_FIELD_NAME && field.isActive === true,
            )
          : findPreferredRelationFieldToTarget({
              fields: filterableFields,
              targetObjectMetadataId,
            });

      return [
        slot.id,
        isDefined(boundField) ? { fieldMetadataId: boundField.id } : null,
      ];
    }),
  );
};
