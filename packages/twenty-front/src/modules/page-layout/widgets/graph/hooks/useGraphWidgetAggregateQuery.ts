import { useAggregateRecords } from '@/object-record/hooks/useAggregateRecords';
import { computeAggregateValueAndLabel } from '@/object-record/record-board/record-board-column/utils/computeAggregateValueAndLabel';
import { convertAggregateOperationToExtendedAggregateOperation } from '@/object-record/utils/convertAggregateOperationToExtendedAggregateOperation';
import { useGraphWidgetQueryCommon } from '@/page-layout/widgets/graph/hooks/useGraphWidgetQueryCommon';
import { UserContext } from '@/users/contexts/UserContext';
import { useContext } from 'react';
import { useRecoilValue } from 'recoil';
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

  const { value, label } = computeAggregateValueAndLabel({
    data,
    objectMetadataItem,
    fieldMetadataId: configuration.aggregateFieldMetadataId,
    aggregateOperation: extendedAggregateOperation,
    dateFormat,
    timeFormat,
    timeZone,
    localeCatalog: dateLocale.localeCatalog,
  });

  return {
    value,
    label,
    loading,
    error,
  };
};
