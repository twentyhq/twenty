import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { getFilterFilterableFieldMetadataItems } from '@/object-metadata/utils/getFilterFilterableFieldMetadataItems';
import { isManyToOneRelationField } from '@/object-metadata/utils/isManyToOneRelationField';
import { type DashboardFilterCandidateDimension } from '@/page-layout/dashboard-filters/types/DashboardFilterCandidateDimension';
import { type DashboardFilterObjectMetadataItem } from '@/page-layout/dashboard-filters/types/DashboardFilterObjectMetadataItem';
import { collectBoundDashboardFilterDimensionKeys } from '@/page-layout/dashboard-filters/utils/collectBoundDashboardFilterDimensionKeys';
import { findPreferredRelationFieldToTarget } from '@/page-layout/dashboard-filters/utils/findPreferredRelationFieldToTarget';
import { getDashboardFilterFieldDimensionKey } from '@/page-layout/dashboard-filters/utils/getDashboardFilterFieldDimensionKey';
import { getDashboardFilterRelationTargetDimensionKey } from '@/page-layout/dashboard-filters/utils/getDashboardFilterRelationTargetDimensionKey';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { type DashboardFilterBinding } from 'twenty-shared/types';
import { getFilterTypeFromFieldType, isDefined } from 'twenty-shared/utils';
import { WidgetType } from '~/generated-metadata/graphql';

const ID_FIELD_NAME = 'id';

export type ComputeDashboardFilterCandidateDimensionsArgs = {
  widgets: Pick<PageLayoutWidget, 'id' | 'type' | 'objectMetadataId'>[];
  objectMetadataItems: DashboardFilterObjectMetadataItem[];
  existingBindingsByWidgetId?: Record<
    string,
    Record<string, DashboardFilterBinding | null>
  >;
  isJsonFilterEnabled?: boolean;
};

type GraphWidgetWithObject = {
  widgetId: string;
  objectMetadataItem: DashboardFilterObjectMetadataItem;
  filterableFields: FieldMetadataItem[];
};

type FieldWithOwner = {
  field: FieldMetadataItem;
  objectMetadataId: string;
};

const countBoundWidgets = (dimension: DashboardFilterCandidateDimension) =>
  Object.keys(dimension.proposedBindingsByWidgetId).length;

const compareDimensions = (
  dimensionA: DashboardFilterCandidateDimension,
  dimensionB: DashboardFilterCandidateDimension,
) =>
  countBoundWidgets(dimensionB) - countBoundWidgets(dimensionA) ||
  dimensionA.label.localeCompare(dimensionB.label);

const groupBindingsBySlotId = (
  bindingsByWidgetId: Record<
    string,
    Record<string, DashboardFilterBinding | null>
  >,
): Record<string, Record<string, DashboardFilterBinding | null>> => {
  const bindingsBySlotId: Record<
    string,
    Record<string, DashboardFilterBinding | null>
  > = {};

  for (const [widgetId, bindings] of Object.entries(bindingsByWidgetId)) {
    for (const [slotId, binding] of Object.entries(bindings)) {
      bindingsBySlotId[slotId] = {
        ...bindingsBySlotId[slotId],
        [widgetId]: binding,
      };
    }
  }

  return bindingsBySlotId;
};

const isDimensionCoveredBySlot = (
  dimension: DashboardFilterCandidateDimension,
  slotBindings: Record<string, DashboardFilterBinding | null>,
) =>
  Object.entries(dimension.proposedBindingsByWidgetId).every(
    ([widgetId, binding]) =>
      slotBindings[widgetId]?.fieldMetadataId === binding.fieldMetadataId,
  );

const buildFieldDimensions = (
  graphWidgets: GraphWidgetWithObject[],
): Map<string, DashboardFilterCandidateDimension> => {
  const fieldDimensionsByKey = new Map<
    string,
    DashboardFilterCandidateDimension
  >();

  for (const { widgetId, filterableFields } of graphWidgets) {
    for (const field of filterableFields) {
      // A filter on raw ids only makes sense as the target side of a relation dimension.
      if (field.name === ID_FIELD_NAME) {
        continue;
      }

      const filterType = getFilterTypeFromFieldType(field.type);

      // The filterable predicate never yields a search vector, but the type still has to be narrowed.
      if (filterType === 'TS_VECTOR') {
        continue;
      }

      const key = getDashboardFilterFieldDimensionKey(field);

      const dimension = fieldDimensionsByKey.get(key) ?? {
        key,
        label: field.label,
        icon: field.icon,
        filterType,
        proposedBindingsByWidgetId: {},
      };

      if (!isDefined(dimension.proposedBindingsByWidgetId[widgetId])) {
        dimension.proposedBindingsByWidgetId[widgetId] = {
          fieldMetadataId: field.id,
        };
      }

      fieldDimensionsByKey.set(key, dimension);
    }
  }

  return fieldDimensionsByKey;
};

const buildRelationTargetDimensions = ({
  graphWidgets,
  objectMetadataItemById,
}: {
  graphWidgets: GraphWidgetWithObject[];
  objectMetadataItemById: Map<string, DashboardFilterObjectMetadataItem>;
}): Map<string, DashboardFilterCandidateDimension> => {
  const reachableTargetObjectMetadataIds = new Set(
    graphWidgets.flatMap(({ filterableFields }) =>
      filterableFields
        .filter(isManyToOneRelationField)
        .map((field) => field.relation.targetObjectMetadata.id),
    ),
  );

  const relationTargetDimensionsByTargetId = new Map<
    string,
    DashboardFilterCandidateDimension
  >();

  for (const targetObjectMetadataId of reachableTargetObjectMetadataIds) {
    const targetObjectMetadataItem = objectMetadataItemById.get(
      targetObjectMetadataId,
    );

    if (!isDefined(targetObjectMetadataItem)) {
      continue;
    }

    const proposedBindingsByWidgetId: Record<string, DashboardFilterBinding> =
      {};

    for (const {
      widgetId,
      objectMetadataItem,
      filterableFields,
    } of graphWidgets) {
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

      if (isDefined(boundField)) {
        proposedBindingsByWidgetId[widgetId] = {
          fieldMetadataId: boundField.id,
        };
      }
    }

    relationTargetDimensionsByTargetId.set(targetObjectMetadataId, {
      key: getDashboardFilterRelationTargetDimensionKey(targetObjectMetadataId),
      label: targetObjectMetadataItem.labelSingular,
      icon: targetObjectMetadataItem.icon,
      filterType: 'RELATION',
      proposedBindingsByWidgetId,
      relationTargetObjectMetadataId: targetObjectMetadataId,
    });
  }

  return relationTargetDimensionsByTargetId;
};

// A relation field dimension that proposes exactly what its target dimension proposes would only duplicate it.
const isRelationFieldDimensionSubsumed = ({
  dimension,
  relationTargetDimensionsByTargetId,
  fieldById,
}: {
  dimension: DashboardFilterCandidateDimension;
  relationTargetDimensionsByTargetId: Map<
    string,
    DashboardFilterCandidateDimension
  >;
  fieldById: Map<string, FieldWithOwner>;
}) =>
  dimension.filterType === 'RELATION' &&
  Object.entries(dimension.proposedBindingsByWidgetId).every(
    ([widgetId, binding]) => {
      const boundField = fieldById.get(binding.fieldMetadataId)?.field;

      if (!isDefined(boundField) || !isManyToOneRelationField(boundField)) {
        return false;
      }

      return (
        relationTargetDimensionsByTargetId.get(
          boundField.relation.targetObjectMetadata.id,
        )?.proposedBindingsByWidgetId[widgetId]?.fieldMetadataId ===
        binding.fieldMetadataId
      );
    },
  );

export const computeDashboardFilterCandidateDimensions = ({
  widgets,
  objectMetadataItems,
  existingBindingsByWidgetId = {},
  isJsonFilterEnabled = false,
}: ComputeDashboardFilterCandidateDimensionsArgs): DashboardFilterCandidateDimension[] => {
  const objectMetadataItemById = new Map(
    objectMetadataItems.map((objectMetadataItem) => [
      objectMetadataItem.id,
      objectMetadataItem,
    ]),
  );

  const fieldById = new Map<string, FieldWithOwner>(
    objectMetadataItems.flatMap((objectMetadataItem) =>
      objectMetadataItem.fields.map((field): [string, FieldWithOwner] => [
        field.id,
        { field, objectMetadataId: objectMetadataItem.id },
      ]),
    ),
  );

  const isFilterableField = getFilterFilterableFieldMetadataItems({
    isJsonFilterEnabled,
  });

  const graphWidgets = widgets.flatMap((widget): GraphWidgetWithObject[] => {
    if (
      widget.type !== WidgetType.GRAPH ||
      !isDefined(widget.objectMetadataId)
    ) {
      return [];
    }

    const objectMetadataItem = objectMetadataItemById.get(
      widget.objectMetadataId,
    );

    if (!isDefined(objectMetadataItem)) {
      return [];
    }

    return [
      {
        widgetId: widget.id,
        objectMetadataItem,
        filterableFields: objectMetadataItem.fields.filter(isFilterableField),
      },
    ];
  });

  const fieldDimensionsByKey = buildFieldDimensions(graphWidgets);

  const relationTargetDimensionsByTargetId = buildRelationTargetDimensions({
    graphWidgets,
    objectMetadataItemById,
  });

  const bindingsBySlotId = groupBindingsBySlotId(existingBindingsByWidgetId);

  const boundDimensionKeys = collectBoundDashboardFilterDimensionKeys({
    bindingsByWidgetId: existingBindingsByWidgetId,
    objectMetadataItems,
  });

  const existingSlotBindings = Object.values(bindingsBySlotId);

  const fieldDimensions = Array.from(fieldDimensionsByKey.values()).filter(
    (dimension) =>
      !boundDimensionKeys.has(dimension.key) &&
      !isRelationFieldDimensionSubsumed({
        dimension,
        relationTargetDimensionsByTargetId,
        fieldById,
      }),
  );

  const relationTargetDimensions = Array.from(
    relationTargetDimensionsByTargetId.values(),
  ).filter(
    (dimension) =>
      countBoundWidgets(dimension) > 0 &&
      !existingSlotBindings.some((slotBindings) =>
        isDimensionCoveredBySlot(dimension, slotBindings),
      ),
  );

  return [...fieldDimensions, ...relationTargetDimensions].sort(
    compareDimensions,
  );
};
