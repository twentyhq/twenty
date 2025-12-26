import { useAggregateRecords } from '@/object-record/hooks/useAggregateRecords';
import { transformAggregateRawValueIntoAggregateDisplayValue } from '@/object-record/record-aggregate/utils/transformAggregateRawValueIntoAggregateDisplayValue';
import { getAggregateOperationLabel } from '@/object-record/record-board/record-board-column/utils/getAggregateOperationLabel';
import { AggregateOperations } from '@/object-record/record-table/constants/AggregateOperations';
import { getRecordAggregateDisplayLabel } from '@/object-record/record-index/utils/getRecordndexAggregateDisplayLabel';

import { convertAggregateOperationToExtendedAggregateOperation } from '@/object-record/utils/convertAggregateOperationToExtendedAggregateOperation';
import { buildRatioNumeratorFilter } from '@/page-layout/widgets/graph/graphWidgetAggregateChart/utils/buildRatioNumeratorFilter';
import { computeRatioDisplayValue } from '@/page-layout/widgets/graph/graphWidgetAggregateChart/utils/computeRatioDisplayValue';
import { useGraphWidgetQueryCommon } from '@/page-layout/widgets/graph/hooks/useGraphWidgetQueryCommon';
import { UserContext } from '@/users/contexts/UserContext';
import { t } from '@lingui/core/macro';
import { useContext } from 'react';
import { useRecoilValue } from 'recoil';
import { FIELD_FOR_TOTAL_COUNT_AGGREGATE_OPERATION } from 'twenty-shared/constants';
import { findById, isDefined } from 'twenty-shared/utils';
import { type AggregateChartConfiguration } from '~/generated/graphql';
import { dateLocaleState } from '~/localization/states/dateLocaleState';

export const useGraphWidgetAggregateQuery = ({
  objectMetadataItemId,
  configuration,
}: {
  objectMetadataItemId: string;
  configuration: AggregateChartConfiguration;
}) => {
  const { objectMetadataItem, gqlOperationFilter, aggregateField } =
    useGraphWidgetQueryCommon({
      objectMetadataItemId,
      configuration,
    });

  const aggregateOperation = configuration.aggregateOperation;
  const ratioConfig = configuration.ratioAggregateConfig;
  const isRatioQuery = isDefined(ratioConfig);

  const ratioField = isRatioQuery
    ? objectMetadataItem.fields.find(
        (field) => field.id === ratioConfig.fieldMetadataId,
      )
    : undefined;

  const ratioNumeratorFilter = buildRatioNumeratorFilter({
    ratioConfig,
    ratioField,
    baseFilter: gqlOperationFilter,
  });

  const extendedAggregateOperation =
    convertAggregateOperationToExtendedAggregateOperation(
      aggregateOperation,
      aggregateField.type,
    );

  const { data, loading, error } = useAggregateRecords({
    objectNameSingular: objectMetadataItem.nameSingular,
    recordGqlFieldsAggregate: {
      [aggregateField.name]: [extendedAggregateOperation],
    },
    filter: gqlOperationFilter,
    skip: isRatioQuery,
  });

  const {
    data: ratioNumeratorData,
    loading: ratioNumeratorLoading,
    error: ratioNumeratorError,
  } = useAggregateRecords({
    objectNameSingular: objectMetadataItem.nameSingular,
    recordGqlFieldsAggregate: {
      [FIELD_FOR_TOTAL_COUNT_AGGREGATE_OPERATION]: [AggregateOperations.COUNT],
    },
    filter: ratioNumeratorFilter,
    skip: !isRatioQuery,
  });

  const {
    data: ratioDenominatorData,
    loading: ratioDenominatorLoading,
    error: ratioDenominatorError,
  } = useAggregateRecords({
    objectNameSingular: objectMetadataItem.nameSingular,
    recordGqlFieldsAggregate: {
      [FIELD_FOR_TOTAL_COUNT_AGGREGATE_OPERATION]: [AggregateOperations.COUNT],
    },
    filter: gqlOperationFilter,
    skip: !isRatioQuery,
  });

  const { dateFormat, timeFormat, timeZone } = useContext(UserContext);
  const dateLocale = useRecoilValue(dateLocaleState);

  if (isRatioQuery) {
    const isRatioLoading = ratioNumeratorLoading || ratioDenominatorLoading;
    const hasRatioData =
      isDefined(ratioNumeratorData) && isDefined(ratioDenominatorData);

    if (isRatioLoading || !hasRatioData) {
      return {
        value: '-',
        label: t`Ratio`,
        loading: isRatioLoading,
        error: ratioNumeratorError ?? ratioDenominatorError,
      };
    }

    const numeratorCount =
      ratioNumeratorData[FIELD_FOR_TOTAL_COUNT_AGGREGATE_OPERATION]?.[
        AggregateOperations.COUNT
      ] ?? 0;

    const denominatorCount =
      ratioDenominatorData[FIELD_FOR_TOTAL_COUNT_AGGREGATE_OPERATION]?.[
        AggregateOperations.COUNT
      ] ?? 0;

    return {
      value: computeRatioDisplayValue({
        numeratorCount: Number(numeratorCount),
        denominatorCount: Number(denominatorCount),
      }),
      label: t`Ratio`,
      loading: false,
      error: ratioNumeratorError ?? ratioDenominatorError,
    };
  }

  const aggregateFieldMetadataItem = objectMetadataItem.fields.find(
    findById(configuration.aggregateFieldMetadataId),
  );

  if (!isDefined(aggregateFieldMetadataItem)) {
    return {
      value:
        data?.[FIELD_FOR_TOTAL_COUNT_AGGREGATE_OPERATION]?.[
          AggregateOperations.COUNT
        ],
      label: getAggregateOperationLabel(AggregateOperations.COUNT),
      loading,
      error,
    };
  }

  const aggregateRawValue =
    data[aggregateFieldMetadataItem.name]?.[aggregateOperation];

  const aggregateDisplayLabel = getRecordAggregateDisplayLabel({
    aggregateFieldMetadataItem,
    aggregateOperation,
  });

  const aggregateDisplayValue =
    transformAggregateRawValueIntoAggregateDisplayValue({
      aggregateFieldMetadataItem: aggregateFieldMetadataItem,
      aggregateOperation: extendedAggregateOperation,
      aggregateRawValue: aggregateRawValue,
      dateFormat,
      localeCatalog: dateLocale.localeCatalog,
      timeFormat,
      timeZone,
    });

  return {
    value: aggregateDisplayValue,
    label: aggregateDisplayLabel,
    loading,
    error,
  };
};
