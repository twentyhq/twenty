import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { isManyToOneRelationField } from '@/object-metadata/utils/isManyToOneRelationField';
import {
  type DashboardFilterCandidateDimension,
  type DashboardFilterCandidateDimensionBuiltInInput,
} from '@/page-layout/dashboard-filters/types/DashboardFilterCandidateDimension';
import { findManyToOneRelationFieldTargetingObject } from '@/page-layout/dashboard-filters/utils/findManyToOneRelationFieldTargetingObject';
import { getDashboardFilterFieldDimensionKey } from '@/page-layout/dashboard-filters/utils/getDashboardFilterFieldDimensionKey';
import {
  getDashboardFilterSlotFilterTypeForField,
  isDashboardFilterCandidateField,
} from '@/page-layout/dashboard-filters/utils/isDashboardFilterCandidateField';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import {
  type DashboardFilterBinding,
  type DashboardFilterSlotFilterType,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { WidgetType } from '~/generated-metadata/graphql';

type CandidateObjectMetadataItem = Pick<
  EnrichedObjectMetadataItem,
  'id' | 'labelSingular' | 'fields'
>;

type DimensionAccumulator = {
  id: string;
  label: string;
  filterType: DashboardFilterSlotFilterType;
  bindingByWidgetId: Record<string, DashboardFilterBinding>;
};

const FIELD_DIMENSION_ID_PREFIX = 'field';
const RELATION_TARGET_DIMENSION_ID_PREFIX = 'relation-target';

const collectFieldDimensions = ({
  widgetId,
  fields,
  dimensionsById,
}: {
  widgetId: string;
  fields: FieldMetadataItem[];
  dimensionsById: Map<string, DimensionAccumulator>;
}) => {
  for (const field of fields) {
    const filterType = getDashboardFilterSlotFilterTypeForField(field);

    // Relations are offered per target object below, not per field name.
    if (
      !isDashboardFilterCandidateField(field) ||
      !isDefined(filterType) ||
      filterType === 'RELATION'
    ) {
      continue;
    }

    const dimensionId = `${FIELD_DIMENSION_ID_PREFIX}:${getDashboardFilterFieldDimensionKey(field)}`;

    const dimension = dimensionsById.get(dimensionId) ?? {
      id: dimensionId,
      label: field.label,
      filterType,
      bindingByWidgetId: {},
    };

    dimension.bindingByWidgetId[widgetId] ??= { fieldMetadataId: field.id };

    dimensionsById.set(dimensionId, dimension);
  }
};

const collectRelationTargetDimensions = ({
  widgetId,
  fields,
  objectMetadataItems,
  dimensionsById,
}: {
  widgetId: string;
  fields: FieldMetadataItem[];
  objectMetadataItems: CandidateObjectMetadataItem[];
  dimensionsById: Map<string, DimensionAccumulator>;
}) => {
  const relationFields = fields
    .filter(isDashboardFilterCandidateField)
    .filter(isManyToOneRelationField);

  const targetObjectMetadataIds = new Set(
    relationFields.map((field) => field.relation.targetObjectMetadata.id),
  );

  for (const targetObjectMetadataId of targetObjectMetadataIds) {
    const relationField = findManyToOneRelationFieldTargetingObject({
      fields: relationFields,
      targetObjectMetadataId,
    });

    if (!isDefined(relationField)) {
      continue;
    }

    const dimensionId = `${RELATION_TARGET_DIMENSION_ID_PREFIX}:${targetObjectMetadataId}`;

    const dimension = dimensionsById.get(dimensionId) ?? {
      id: dimensionId,
      label:
        objectMetadataItems.find(
          (objectMetadataItem) =>
            objectMetadataItem.id === targetObjectMetadataId,
        )?.labelSingular ??
        relationField.relation.targetObjectMetadata.nameSingular,
      filterType: 'RELATION',
      bindingByWidgetId: {},
    };

    dimension.bindingByWidgetId[widgetId] = {
      fieldMetadataId: relationField.id,
    };

    dimensionsById.set(dimensionId, dimension);
  }
};

const toCandidateDimension = ({
  id,
  label,
  filterType,
  bindingByWidgetId,
  chartWidgetIds,
  isBuiltIn,
}: Omit<DimensionAccumulator, 'bindingByWidgetId'> & {
  bindingByWidgetId: Record<string, DashboardFilterBinding | null | undefined>;
  chartWidgetIds: string[];
  isBuiltIn?: boolean;
}): DashboardFilterCandidateDimension => {
  // Every chart gets an explicit entry: null is what the slot writes for a chart it does not apply to.
  const proposedBindingsByWidgetId = Object.fromEntries(
    chartWidgetIds.map((widgetId) => [
      widgetId,
      bindingByWidgetId[widgetId] ?? null,
    ]),
  );

  return {
    id,
    label,
    filterType,
    proposedBindingsByWidgetId,
    boundChartCount: Object.values(proposedBindingsByWidgetId).filter(isDefined)
      .length,
    chartCount: chartWidgetIds.length,
    ...(isBuiltIn === true ? { isBuiltIn } : {}),
  };
};

// Candidates are what the dashboard's charts can be filtered on at once: a field shared by several objects counts once, and relations to the same object count once whatever the field is called.
export const computeDashboardFilterCandidateDimensions = ({
  widgets,
  objectMetadataItems,
  builtInSlotsAndBindings,
}: {
  widgets: PageLayoutWidget[];
  objectMetadataItems: CandidateObjectMetadataItem[];
  builtInSlotsAndBindings?: DashboardFilterCandidateDimensionBuiltInInput;
}): DashboardFilterCandidateDimension[] => {
  const chartWidgets = widgets.filter(
    (widget) => widget.type === WidgetType.GRAPH,
  );
  const chartWidgetIds = chartWidgets.map((widget) => widget.id);

  const dimensionsById = new Map<string, DimensionAccumulator>();

  for (const widget of chartWidgets) {
    const fields =
      objectMetadataItems.find(
        (objectMetadataItem) =>
          objectMetadataItem.id === widget.objectMetadataId,
      )?.fields ?? [];

    collectFieldDimensions({ widgetId: widget.id, fields, dimensionsById });
    collectRelationTargetDimensions({
      widgetId: widget.id,
      fields,
      objectMetadataItems,
      dimensionsById,
    });
  }

  const builtInDimensions = (builtInSlotsAndBindings?.slots ?? []).map((slot) =>
    toCandidateDimension({
      id: slot.id,
      label: slot.label,
      filterType: slot.filterType,
      bindingByWidgetId: Object.fromEntries(
        chartWidgetIds.map((widgetId) => [
          widgetId,
          builtInSlotsAndBindings?.bindingsByWidgetId[widgetId]?.[slot.id],
        ]),
      ),
      chartWidgetIds,
      isBuiltIn: true,
    }),
  );

  const computedDimensions = [...dimensionsById.values()]
    .map((dimension) => toCandidateDimension({ ...dimension, chartWidgetIds }))
    .toSorted(
      (dimensionA, dimensionB) =>
        dimensionB.boundChartCount - dimensionA.boundChartCount ||
        dimensionA.label.localeCompare(dimensionB.label),
    );

  return [...builtInDimensions, ...computedDimensions];
};
