import { useAggregateRecords } from '@/object-record/hooks/useAggregateRecords';
import { computeAggregateValueAndLabel } from '@/object-record/record-board/record-board-column/utils/computeAggregateValueAndLabel';
import { type ExtendedAggregateOperations } from '@/object-record/record-table/types/ExtendedAggregateOperations';
import { useGraphWidgetQueryCommon } from '@/page-layout/widgets/graph/hooks/useGraphWidgetQueryCommon';
import { UserContext } from '@/users/contexts/UserContext';
import { useContext } from 'react';
import { useRecoilValue } from 'recoil';
import { type NumberChartConfiguration } from '~/generated/graphql';
import { dateLocaleState } from '~/localization/states/dateLocaleState';

export const useGraphWidgetAggregateQuery = ({
  objectMetadataItemId,
  configuration,
}: {
  objectMetadataItemId: string;
  configuration: NumberChartConfiguration;
}) => {
  const { objectMetadataItem, gqlOperationFilter, aggregateField } =
    useGraphWidgetQueryCommon({
      objectMetadataItemId,
      configuration,
    });

  // TODO: Move this enum to shared
  const aggregateOperation =
    configuration.aggregateOperation as unknown as ExtendedAggregateOperations;

  const { data, loading, error } = useAggregateRecords({
    objectNameSingular: objectMetadataItem.nameSingular,
    recordGqlFieldsAggregate: {
      [aggregateField.name]: [aggregateOperation],
    },
    filter: gqlOperationFilter,
  });

  const { dateFormat, timeFormat, timeZone } = useContext(UserContext);
  const dateLocale = useRecoilValue(dateLocaleState);

  const { value, label } = computeAggregateValueAndLabel({
    data,
    objectMetadataItem,
    fieldMetadataId: configuration.aggregateFieldMetadataId,
    aggregateOperation,
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
