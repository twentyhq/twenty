import { useObjectMetadataItemById } from '@/object-metadata/hooks/useObjectMetadataItemById';
import { useAggregateRecords } from '@/object-record/hooks/useAggregateRecords';
import { transformAggregateRawValueIntoAggregateDisplayValue } from '@/object-record/record-aggregate/utils/transformAggregateRawValueIntoAggregateDisplayValue';
import { getAggregateOperationLabel } from '@/object-record/record-board/record-board-column/utils/getAggregateOperationLabel';
import { AggregateOperations } from '@/object-record/record-table/constants/AggregateOperations';
import { convertAggregateOperationToExtendedAggregateOperation } from '@/object-record/utils/convertAggregateOperationToExtendedAggregateOperation';
import { useGraphWidgetQueryCommon } from '@/page-layout/widgets/graph/hooks/useGraphWidgetQueryCommon';
import { UserContext } from '@/users/contexts/UserContext';
import { t } from '@lingui/core/macro';
import { useContext, useMemo } from 'react';
import { useRecoilValue } from 'recoil';
import { FIELD_FOR_TOTAL_COUNT_AGGREGATE_OPERATION } from 'twenty-shared/constants';
import { findById, isDefined } from 'twenty-shared/utils';
import { type PieChartConfiguration } from '~/generated/graphql';
import { dateLocaleState } from '~/localization/states/dateLocaleState';

type UsePieChartCenterMetricDataProps = {
  objectMetadataItemId: string;
  configuration: PieChartConfiguration;
  skip: boolean;
};

type UsePieChartCenterMetricDataResult = {
  centerMetricValue: string | number | undefined;
  centerMetricLabel: string;
};

export const usePieChartCenterMetricData = ({
  objectMetadataItemId,
  configuration,
  skip,
}: UsePieChartCenterMetricDataProps): UsePieChartCenterMetricDataResult => {
  const { objectMetadataItem } = useObjectMetadataItemById({
    objectId: objectMetadataItemId,
  });

  const { gqlOperationFilter, aggregateField } = useGraphWidgetQueryCommon({
    objectMetadataItemId,
    configuration,
  });

  const groupByField = objectMetadataItem.fields.find(
    (field) => field.id === configuration.groupByFieldMetadataId,
  );

  const centerMetricFilter = useMemo(() => {
    if (!configuration.hideEmptyCategory || !groupByField) {
      return gqlOperationFilter;
    }

    const notNullFilter = { [groupByField.name]: { is: 'NOT_NULL' as const } };

    return isDefined(gqlOperationFilter)
      ? { and: [gqlOperationFilter, notNullFilter] }
      : notNullFilter;
  }, [gqlOperationFilter, configuration.hideEmptyCategory, groupByField]);

  const centerMetricAggregateOperation =
    configuration.aggregateOperation as AggregateOperations;

  const extendedAggregateOperation =
    convertAggregateOperationToExtendedAggregateOperation(
      centerMetricAggregateOperation,
      aggregateField.type,
    );

  const recordGqlFieldsAggregate = useMemo(
    () => ({
      [aggregateField.name]: [extendedAggregateOperation],
    }),
    [aggregateField.name, extendedAggregateOperation],
  );

  const { data: centerMetricData } = useAggregateRecords({
    objectNameSingular: objectMetadataItem.nameSingular,
    recordGqlFieldsAggregate,
    filter: centerMetricFilter,
    skip,
  });

  const { dateFormat, timeFormat, timeZone } = useContext(UserContext);
  const dateLocale = useRecoilValue(dateLocaleState);

  const aggregateFieldMetadataItem = objectMetadataItem.readableFields.find(
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
      centerMetricData?.[aggregateFieldMetadataItem.name]?.[
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

  return {
    centerMetricValue,
    centerMetricLabel,
  };
};
