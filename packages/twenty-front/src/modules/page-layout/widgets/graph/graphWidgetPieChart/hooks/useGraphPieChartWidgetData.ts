import { useObjectMetadataItemById } from '@/object-metadata/hooks/useObjectMetadataItemById';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { useAggregateRecords } from '@/object-record/hooks/useAggregateRecords';
import { transformAggregateRawValueIntoAggregateDisplayValue } from '@/object-record/record-aggregate/utils/transformAggregateRawValueIntoAggregateDisplayValue';
import { getAggregateOperationLabel } from '@/object-record/record-board/record-board-column/utils/getAggregateOperationLabel';
import { AggregateOperations } from '@/object-record/record-table/constants/AggregateOperations';
import { convertAggregateOperationToExtendedAggregateOperation } from '@/object-record/utils/convertAggregateOperationToExtendedAggregateOperation';
import { EXTRA_ITEM_TO_DETECT_TOO_MANY_GROUPS } from '@/page-layout/widgets/graph/constants/ExtraItemToDetectTooManyGroups.constant';
import { PIE_CHART_MAXIMUM_NUMBER_OF_SLICES } from '@/page-layout/widgets/graph/graphWidgetPieChart/constants/PieChartMaximumNumberOfSlices.constant';
import { type PieChartDataItem } from '@/page-layout/widgets/graph/graphWidgetPieChart/types/PieChartDataItem';
import { transformGroupByDataToPieChartData } from '@/page-layout/widgets/graph/graphWidgetPieChart/utils/transformGroupByDataToPieChartData';
import { useGraphWidgetGroupByQuery } from '@/page-layout/widgets/graph/hooks/useGraphWidgetGroupByQuery';
import { useGraphWidgetQueryCommon } from '@/page-layout/widgets/graph/hooks/useGraphWidgetQueryCommon';
import { type RawDimensionValue } from '@/page-layout/widgets/graph/types/RawDimensionValue';
import { UserContext } from '@/users/contexts/UserContext';
import { t } from '@lingui/core/macro';
import { useContext, useMemo } from 'react';
import { useRecoilValue } from 'recoil';
import { FIELD_FOR_TOTAL_COUNT_AGGREGATE_OPERATION } from 'twenty-shared/constants';
import { findById, isDefined } from 'twenty-shared/utils';
import { type PieChartConfiguration } from '~/generated/graphql';
import { dateLocaleState } from '~/localization/states/dateLocaleState';

type UseGraphPieChartWidgetDataProps = {
  objectMetadataItemId: string;
  configuration: PieChartConfiguration;
};

type UseGraphPieChartWidgetDataResult = {
  data: PieChartDataItem[];
  showLegend: boolean;
  loading: boolean;
  error?: Error;
  hasTooManyGroups: boolean;
  objectMetadataItem: ObjectMetadataItem;
  formattedToRawLookup: Map<string, RawDimensionValue>;
  showDataLabels: boolean;
  showCenterMetric: boolean;
  centerMetricValue: string | number | undefined;
  centerMetricLabel: string;
};

export const useGraphPieChartWidgetData = ({
  objectMetadataItemId,
  configuration,
}: UseGraphPieChartWidgetDataProps): UseGraphPieChartWidgetDataResult => {
  const { objectMetadataItem } = useObjectMetadataItemById({
    objectId: objectMetadataItemId,
  });

  const {
    data: groupByData,
    loading: groupByLoading,
    error: groupByError,
    aggregateOperation,
  } = useGraphWidgetGroupByQuery({
    objectMetadataItemId,
    configuration,
    limit:
      PIE_CHART_MAXIMUM_NUMBER_OF_SLICES + EXTRA_ITEM_TO_DETECT_TOO_MANY_GROUPS,
  });

  const showCenterMetric = configuration.showCenterMetric ?? false;

  const { gqlOperationFilter, aggregateField } = useGraphWidgetQueryCommon({
    objectMetadataItemId,
    configuration,
  });

  const centerMetricAggregateOperation =
    configuration.aggregateOperation as AggregateOperations;

  const extendedAggregateOperation =
    convertAggregateOperationToExtendedAggregateOperation(
      centerMetricAggregateOperation,
      aggregateField.type,
    );

  const {
    data: centerMetricData,
    loading: centerMetricLoading,
    error: centerMetricError,
  } = useAggregateRecords({
    objectNameSingular: objectMetadataItem.nameSingular,
    recordGqlFieldsAggregate: {
      [aggregateField.name]: [extendedAggregateOperation],
    },
    filter: gqlOperationFilter,
    skip: !showCenterMetric,
  });

  const { dateFormat, timeFormat, timeZone } = useContext(UserContext);
  const dateLocale = useRecoilValue(dateLocaleState);

  const aggregateFieldMetadataItem = objectMetadataItem.fields.find(
    findById(configuration.aggregateFieldMetadataId),
  );

  const centerMetricLabel = useMemo(() => {
    const isCountOrSum =
      centerMetricAggregateOperation === AggregateOperations.SUM ||
      centerMetricAggregateOperation === AggregateOperations.COUNT ||
      centerMetricAggregateOperation === AggregateOperations.COUNT_EMPTY ||
      centerMetricAggregateOperation === AggregateOperations.COUNT_NOT_EMPTY ||
      centerMetricAggregateOperation ===
        AggregateOperations.COUNT_UNIQUE_VALUES ||
      centerMetricAggregateOperation === AggregateOperations.COUNT_TRUE ||
      centerMetricAggregateOperation === AggregateOperations.COUNT_FALSE;

    if (isCountOrSum) {
      return t`Total`;
    }

    const isPercentage =
      centerMetricAggregateOperation === AggregateOperations.PERCENTAGE_EMPTY ||
      centerMetricAggregateOperation ===
        AggregateOperations.PERCENTAGE_NOT_EMPTY;

    if (isPercentage) {
      return t`Percentage`;
    }

    return getAggregateOperationLabel(centerMetricAggregateOperation);
  }, [centerMetricAggregateOperation]);

  const centerMetricValue = useMemo(() => {
    if (!isDefined(aggregateFieldMetadataItem)) {
      return centerMetricData?.[FIELD_FOR_TOTAL_COUNT_AGGREGATE_OPERATION]?.[
        AggregateOperations.COUNT
      ];
    }

    const aggregateRawValue =
      centerMetricData[aggregateFieldMetadataItem.name]?.[
        centerMetricAggregateOperation
      ];

    return transformAggregateRawValueIntoAggregateDisplayValue({
      aggregateFieldMetadataItem,
      aggregateOperation: extendedAggregateOperation,
      aggregateRawValue,
      dateFormat,
      localeCatalog: dateLocale.localeCatalog,
      timeFormat,
      timeZone,
    });
  }, [
    aggregateFieldMetadataItem,
    centerMetricData,
    centerMetricAggregateOperation,
    extendedAggregateOperation,
    dateFormat,
    dateLocale.localeCatalog,
    timeFormat,
    timeZone,
  ]);

  const transformedData = useMemo(
    () =>
      transformGroupByDataToPieChartData({
        groupByData,
        objectMetadataItem,
        configuration,
        aggregateOperation,
      }),
    [groupByData, objectMetadataItem, configuration, aggregateOperation],
  );

  return {
    ...transformedData,
    objectMetadataItem,
    showDataLabels: configuration.displayDataLabel ?? false,
    showCenterMetric,
    centerMetricValue,
    centerMetricLabel,
    loading: groupByLoading || centerMetricLoading,
    error: groupByError ?? centerMetricError,
  };
};
