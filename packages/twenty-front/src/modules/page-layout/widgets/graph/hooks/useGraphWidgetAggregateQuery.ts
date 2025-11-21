import { useAggregateRecords } from '@/object-record/hooks/useAggregateRecords';
import { transformAggregateRawValueIntoAggregateDisplayValue } from '@/object-record/record-aggregate/utils/transformAggregateRawValueIntoAggregateDisplayValue';
import { getAggregateOperationLabel } from '@/object-record/record-board/record-board-column/utils/getAggregateOperationLabel';
import { getRecordAggregateDisplayLabel } from '@/object-record/record-index/utils/getRecordndexAggregateDisplayLabel';

import { convertAggregateOperationToExtendedAggregateOperation } from '@/object-record/utils/convertAggregateOperationToExtendedAggregateOperation';
import { useGraphWidgetQueryCommon } from '@/page-layout/widgets/graph/hooks/useGraphWidgetQueryCommon';
import { UserContext } from '@/users/contexts/UserContext';
import { useContext } from 'react';
import { useRecoilValue } from 'recoil';
import { FIELD_FOR_TOTAL_COUNT_AGGREGATE_OPERATION } from 'twenty-shared/constants';
import { findById, isDefined } from 'twenty-shared/utils';
import {
  AggregateOperations,
  type AggregateChartConfiguration,
} from '~/generated/graphql';
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
  });

  const { dateFormat, timeFormat, timeZone } = useContext(UserContext);
  const dateLocale = useRecoilValue(dateLocaleState);

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
