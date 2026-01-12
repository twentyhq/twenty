import { isDefined, type RecordFilter } from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByUniversalIdentifierOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier-or-throw.util';
import { replaceFlatEntityInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/replace-flat-entity-in-flat-entity-maps-or-throw.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type FlatPageLayoutWidget } from 'src/engine/metadata-modules/flat-page-layout-widget/types/flat-page-layout-widget.type';
import { isFlatPageLayoutWidgetConfigurationOfType } from 'src/engine/metadata-modules/flat-page-layout-widget/utils/is-flat-page-layout-widget-configuration-of-type.util';
import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';
import { STANDARD_OBJECTS } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-object.constant';
import { STANDARD_PAGE_LAYOUTS } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-page-layout.constant';

type UpdateStandardPageLayoutWidgetsArgs = {
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  flatPageLayoutWidgetMaps: FlatEntityMaps<FlatPageLayoutWidget>;
};

const findWidgetByUniversalIdentifierOrThrow = <
  T extends WidgetConfigurationType,
>({
  flatPageLayoutWidgetMaps,
  universalIdentifier,
  widgetDescription,
  expectedConfigurationType,
}: {
  flatPageLayoutWidgetMaps: FlatEntityMaps<FlatPageLayoutWidget>;
  universalIdentifier: string;
  widgetDescription: string;
  expectedConfigurationType: T;
}): FlatPageLayoutWidget<T> => {
  const flatPageLayoutWidget = findFlatEntityByUniversalIdentifierOrThrow({
    flatEntityMaps: flatPageLayoutWidgetMaps,
    universalIdentifier,
  });

  if (
    !isFlatPageLayoutWidgetConfigurationOfType(
      flatPageLayoutWidget,
      expectedConfigurationType,
    )
  ) {
    throw new Error(
      `Widget ${widgetDescription} has unexpected configuration type ${flatPageLayoutWidget.configuration.configurationType}, expected ${expectedConfigurationType}`,
    );
  }

  return flatPageLayoutWidget;
};

// Widget updater: dealsByCompany (PIE_CHART)
const updateDealsByCompanyWidget = ({
  flatFieldMetadataMaps,
  flatObjectMetadataMaps,
  flatPageLayoutWidgetMaps,
}: UpdateStandardPageLayoutWidgetsArgs): FlatEntityMaps<FlatPageLayoutWidget> => {
  const opportunityIdField = findFlatEntityByUniversalIdentifierOrThrow({
    flatEntityMaps: flatFieldMetadataMaps,
    universalIdentifier:
      STANDARD_OBJECTS.opportunity.fields.id.universalIdentifier,
  });

  const opportunityCompanyField = findFlatEntityByUniversalIdentifierOrThrow({
    flatEntityMaps: flatFieldMetadataMaps,
    universalIdentifier:
      STANDARD_OBJECTS.opportunity.fields.company.universalIdentifier,
  });

  const opportunityObject = findFlatEntityByUniversalIdentifierOrThrow({
    flatEntityMaps: flatObjectMetadataMaps,
    universalIdentifier: STANDARD_OBJECTS.opportunity.universalIdentifier,
  });

  const widget = findWidgetByUniversalIdentifierOrThrow({
    flatPageLayoutWidgetMaps,
    universalIdentifier:
      STANDARD_PAGE_LAYOUTS.myFirstDashboard.tabs.tab1.widgets.dealsByCompany
        .universalIdentifier,
    widgetDescription: 'dealsByCompany',
    expectedConfigurationType: WidgetConfigurationType.PIE_CHART,
  });

  const updatedWidget: FlatPageLayoutWidget<WidgetConfigurationType.PIE_CHART> =
    {
      ...widget,
      objectMetadataId: opportunityObject.id,
      configuration: {
        ...widget.configuration,
        aggregateFieldMetadataId: opportunityIdField.id,
        groupByFieldMetadataId: opportunityCompanyField.id,
      },
    };

  return replaceFlatEntityInFlatEntityMapsOrThrow({
    flatEntity: updatedWidget,
    flatEntityMaps: flatPageLayoutWidgetMaps,
  });
};

// Widget updater: pipelineValueByStage (BAR_CHART)
const updatePipelineValueByStageWidget = ({
  flatFieldMetadataMaps,
  flatObjectMetadataMaps,
  flatPageLayoutWidgetMaps,
}: UpdateStandardPageLayoutWidgetsArgs): FlatEntityMaps<FlatPageLayoutWidget> => {
  const opportunityAmountField = findFlatEntityByUniversalIdentifierOrThrow({
    flatEntityMaps: flatFieldMetadataMaps,
    universalIdentifier:
      STANDARD_OBJECTS.opportunity.fields.amount.universalIdentifier,
  });

  const opportunityStageField = findFlatEntityByUniversalIdentifierOrThrow({
    flatEntityMaps: flatFieldMetadataMaps,
    universalIdentifier:
      STANDARD_OBJECTS.opportunity.fields.stage.universalIdentifier,
  });

  const opportunityCompanyField = findFlatEntityByUniversalIdentifierOrThrow({
    flatEntityMaps: flatFieldMetadataMaps,
    universalIdentifier:
      STANDARD_OBJECTS.opportunity.fields.company.universalIdentifier,
  });

  const opportunityObject = findFlatEntityByUniversalIdentifierOrThrow({
    flatEntityMaps: flatObjectMetadataMaps,
    universalIdentifier: STANDARD_OBJECTS.opportunity.universalIdentifier,
  });

  const widget = findWidgetByUniversalIdentifierOrThrow({
    flatPageLayoutWidgetMaps,
    universalIdentifier:
      STANDARD_PAGE_LAYOUTS.myFirstDashboard.tabs.tab1.widgets
        .pipelineValueByStage.universalIdentifier,
    widgetDescription: 'pipelineValueByStage',
    expectedConfigurationType: WidgetConfigurationType.BAR_CHART,
  });

  const updatedWidget: FlatPageLayoutWidget<WidgetConfigurationType.BAR_CHART> =
    {
      ...widget,
      objectMetadataId: opportunityObject.id,
      configuration: {
        ...widget.configuration,
        aggregateFieldMetadataId: opportunityAmountField.id,
        primaryAxisGroupByFieldMetadataId: opportunityStageField.id,
        secondaryAxisGroupByFieldMetadataId: opportunityCompanyField.id,
      },
    };

  return replaceFlatEntityInFlatEntityMapsOrThrow({
    flatEntity: updatedWidget,
    flatEntityMaps: flatPageLayoutWidgetMaps,
  });
};

// Widget updater: revenueTimeline (LINE_CHART)
const updateRevenueTimelineWidget = ({
  flatFieldMetadataMaps,
  flatObjectMetadataMaps,
  flatPageLayoutWidgetMaps,
}: UpdateStandardPageLayoutWidgetsArgs): FlatEntityMaps<FlatPageLayoutWidget> => {
  const opportunityAmountField = findFlatEntityByUniversalIdentifierOrThrow({
    flatEntityMaps: flatFieldMetadataMaps,
    universalIdentifier:
      STANDARD_OBJECTS.opportunity.fields.amount.universalIdentifier,
  });

  const opportunityCloseDateField = findFlatEntityByUniversalIdentifierOrThrow({
    flatEntityMaps: flatFieldMetadataMaps,
    universalIdentifier:
      STANDARD_OBJECTS.opportunity.fields.closeDate.universalIdentifier,
  });

  const opportunityObject = findFlatEntityByUniversalIdentifierOrThrow({
    flatEntityMaps: flatObjectMetadataMaps,
    universalIdentifier: STANDARD_OBJECTS.opportunity.universalIdentifier,
  });

  const widget = findWidgetByUniversalIdentifierOrThrow({
    flatPageLayoutWidgetMaps,
    universalIdentifier:
      STANDARD_PAGE_LAYOUTS.myFirstDashboard.tabs.tab1.widgets.revenueTimeline
        .universalIdentifier,
    widgetDescription: 'revenueTimeline',
    expectedConfigurationType: WidgetConfigurationType.LINE_CHART,
  });

  const updatedWidget: FlatPageLayoutWidget<WidgetConfigurationType.LINE_CHART> =
    {
      ...widget,
      objectMetadataId: opportunityObject.id,
      configuration: {
        ...widget.configuration,
        aggregateFieldMetadataId: opportunityAmountField.id,
        primaryAxisGroupByFieldMetadataId: opportunityCloseDateField.id,
      },
    };

  return replaceFlatEntityInFlatEntityMapsOrThrow({
    flatEntity: updatedWidget,
    flatEntityMaps: flatPageLayoutWidgetMaps,
  });
};

// Widget updater: opportunitiesByOwner (BAR_CHART)
const updateOpportunitiesByOwnerWidget = ({
  flatFieldMetadataMaps,
  flatObjectMetadataMaps,
  flatPageLayoutWidgetMaps,
}: UpdateStandardPageLayoutWidgetsArgs): FlatEntityMaps<FlatPageLayoutWidget> => {
  const opportunityIdField = findFlatEntityByUniversalIdentifierOrThrow({
    flatEntityMaps: flatFieldMetadataMaps,
    universalIdentifier:
      STANDARD_OBJECTS.opportunity.fields.id.universalIdentifier,
  });

  const opportunityOwnerField = findFlatEntityByUniversalIdentifierOrThrow({
    flatEntityMaps: flatFieldMetadataMaps,
    universalIdentifier:
      STANDARD_OBJECTS.opportunity.fields.owner.universalIdentifier,
  });

  const opportunityObject = findFlatEntityByUniversalIdentifierOrThrow({
    flatEntityMaps: flatObjectMetadataMaps,
    universalIdentifier: STANDARD_OBJECTS.opportunity.universalIdentifier,
  });

  const widget = findWidgetByUniversalIdentifierOrThrow({
    flatPageLayoutWidgetMaps,
    universalIdentifier:
      STANDARD_PAGE_LAYOUTS.myFirstDashboard.tabs.tab1.widgets
        .opportunitiesByOwner.universalIdentifier,
    widgetDescription: 'opportunitiesByOwner',
    expectedConfigurationType: WidgetConfigurationType.BAR_CHART,
  });

  const updatedWidget: FlatPageLayoutWidget<WidgetConfigurationType.BAR_CHART> =
    {
      ...widget,
      objectMetadataId: opportunityObject.id,
      configuration: {
        ...widget.configuration,
        aggregateFieldMetadataId: opportunityIdField.id,
        primaryAxisGroupByFieldMetadataId: opportunityOwnerField.id,
        secondaryAxisGroupByFieldMetadataId: opportunityOwnerField.id,
      },
    };

  return replaceFlatEntityInFlatEntityMapsOrThrow({
    flatEntity: updatedWidget,
    flatEntityMaps: flatPageLayoutWidgetMaps,
  });
};

// Widget updater: dealsCreatedThisMonth (AGGREGATE_CHART)
const updateDealsCreatedThisMonthWidget = ({
  flatFieldMetadataMaps,
  flatObjectMetadataMaps,
  flatPageLayoutWidgetMaps,
}: UpdateStandardPageLayoutWidgetsArgs): FlatEntityMaps<FlatPageLayoutWidget> => {
  const opportunityIdField = findFlatEntityByUniversalIdentifierOrThrow({
    flatEntityMaps: flatFieldMetadataMaps,
    universalIdentifier:
      STANDARD_OBJECTS.opportunity.fields.id.universalIdentifier,
  });

  const opportunityCreatedAtField = findFlatEntityByUniversalIdentifierOrThrow({
    flatEntityMaps: flatFieldMetadataMaps,
    universalIdentifier:
      STANDARD_OBJECTS.opportunity.fields.createdAt.universalIdentifier,
  });

  const opportunityObject = findFlatEntityByUniversalIdentifierOrThrow({
    flatEntityMaps: flatObjectMetadataMaps,
    universalIdentifier: STANDARD_OBJECTS.opportunity.universalIdentifier,
  });

  const widget = findWidgetByUniversalIdentifierOrThrow({
    flatPageLayoutWidgetMaps,
    universalIdentifier:
      STANDARD_PAGE_LAYOUTS.myFirstDashboard.tabs.tab1.widgets
        .dealsCreatedThisMonth.universalIdentifier,
    widgetDescription: 'dealsCreatedThisMonth',
    expectedConfigurationType: WidgetConfigurationType.AGGREGATE_CHART,
  });

  const updatedRecordFilters = widget.configuration.filter?.recordFilters?.map(
    (filter: RecordFilter) => ({
      ...filter,
      fieldMetadataId: opportunityCreatedAtField.id,
    }),
  );

  const updatedWidget: FlatPageLayoutWidget<WidgetConfigurationType.AGGREGATE_CHART> =
    {
      ...widget,
      objectMetadataId: opportunityObject.id,
      configuration: {
        ...widget.configuration,
        aggregateFieldMetadataId: opportunityIdField.id,
        filter: isDefined(widget.configuration.filter)
          ? {
              ...widget.configuration.filter,
              recordFilters: updatedRecordFilters,
            }
          : undefined,
      },
    };

  return replaceFlatEntityInFlatEntityMapsOrThrow({
    flatEntity: updatedWidget,
    flatEntityMaps: flatPageLayoutWidgetMaps,
  });
};

// Widget updater: dealValueCreatedThisMonth (AGGREGATE_CHART)
const updateDealValueCreatedThisMonthWidget = ({
  flatFieldMetadataMaps,
  flatObjectMetadataMaps,
  flatPageLayoutWidgetMaps,
}: UpdateStandardPageLayoutWidgetsArgs): FlatEntityMaps<FlatPageLayoutWidget> => {
  const opportunityAmountField = findFlatEntityByUniversalIdentifierOrThrow({
    flatEntityMaps: flatFieldMetadataMaps,
    universalIdentifier:
      STANDARD_OBJECTS.opportunity.fields.amount.universalIdentifier,
  });

  const opportunityCreatedAtField = findFlatEntityByUniversalIdentifierOrThrow({
    flatEntityMaps: flatFieldMetadataMaps,
    universalIdentifier:
      STANDARD_OBJECTS.opportunity.fields.createdAt.universalIdentifier,
  });

  const opportunityObject = findFlatEntityByUniversalIdentifierOrThrow({
    flatEntityMaps: flatObjectMetadataMaps,
    universalIdentifier: STANDARD_OBJECTS.opportunity.universalIdentifier,
  });

  const widget = findWidgetByUniversalIdentifierOrThrow({
    flatPageLayoutWidgetMaps,
    universalIdentifier:
      STANDARD_PAGE_LAYOUTS.myFirstDashboard.tabs.tab1.widgets
        .dealValueCreatedThisMonth.universalIdentifier,
    widgetDescription: 'dealValueCreatedThisMonth',
    expectedConfigurationType: WidgetConfigurationType.AGGREGATE_CHART,
  });

  const updatedRecordFilters = widget.configuration.filter?.recordFilters?.map(
    (filter: RecordFilter) => ({
      ...filter,
      fieldMetadataId: opportunityCreatedAtField.id,
    }),
  );

  const updatedWidget: FlatPageLayoutWidget<WidgetConfigurationType.AGGREGATE_CHART> =
    {
      ...widget,
      objectMetadataId: opportunityObject.id,
      configuration: {
        ...widget.configuration,
        aggregateFieldMetadataId: opportunityAmountField.id,
        filter: isDefined(widget.configuration.filter)
          ? {
              ...widget.configuration.filter,
              recordFilters: updatedRecordFilters,
            }
          : undefined,
      },
    };

  return replaceFlatEntityInFlatEntityMapsOrThrow({
    flatEntity: updatedWidget,
    flatEntityMaps: flatPageLayoutWidgetMaps,
  });
};

export const updateStandardPageLayoutWidgetsWithWorkspaceFieldIds = ({
  flatFieldMetadataMaps,
  flatObjectMetadataMaps,
  flatPageLayoutWidgetMaps,
}: UpdateStandardPageLayoutWidgetsArgs): FlatEntityMaps<FlatPageLayoutWidget> => {
  let updatedMaps = flatPageLayoutWidgetMaps;

  updatedMaps = updateDealsByCompanyWidget({
    flatFieldMetadataMaps,
    flatObjectMetadataMaps,
    flatPageLayoutWidgetMaps: updatedMaps,
  });

  updatedMaps = updatePipelineValueByStageWidget({
    flatFieldMetadataMaps,
    flatObjectMetadataMaps,
    flatPageLayoutWidgetMaps: updatedMaps,
  });

  updatedMaps = updateRevenueTimelineWidget({
    flatFieldMetadataMaps,
    flatObjectMetadataMaps,
    flatPageLayoutWidgetMaps: updatedMaps,
  });

  updatedMaps = updateOpportunitiesByOwnerWidget({
    flatFieldMetadataMaps,
    flatObjectMetadataMaps,
    flatPageLayoutWidgetMaps: updatedMaps,
  });

  updatedMaps = updateDealsCreatedThisMonthWidget({
    flatFieldMetadataMaps,
    flatObjectMetadataMaps,
    flatPageLayoutWidgetMaps: updatedMaps,
  });

  updatedMaps = updateDealValueCreatedThisMonthWidget({
    flatFieldMetadataMaps,
    flatObjectMetadataMaps,
    flatPageLayoutWidgetMaps: updatedMaps,
  });

  return updatedMaps;
};
