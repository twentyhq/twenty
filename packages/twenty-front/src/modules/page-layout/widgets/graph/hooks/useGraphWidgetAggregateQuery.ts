import { useNumberFormat } from '@/localization/hooks/useNumberFormat';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { generateAggregateQuery } from '@/object-record/utils/generateAggregateQuery';
import { useGraphWidgetQueryCommon } from '@/page-layout/widgets/graph/hooks/useGraphWidgetQueryCommon';
import { useQuery } from '@apollo/client';
import { useMemo } from 'react';
import { isDefined } from 'twenty-shared/utils';
import {
  FieldMetadataType,
  type NumberChartConfiguration,
} from '~/generated/graphql';
import { convertCurrencyMicrosToCurrencyAmount } from '~/utils/convertCurrencyToCurrencyMicros';
import { formatToShortNumber } from '~/utils/format/formatToShortNumber';

export const useGraphWidgetAggregateQuery = ({
  objectMetadataItemId,
  configuration,
}: {
  objectMetadataItemId: string;
  configuration: NumberChartConfiguration;
}) => {
  const {
    objectMetadataItem,
    aggregateOperation: aggregateOperationFieldName,
    filterQueryVariables,
    aggregateField,
  } = useGraphWidgetQueryCommon({
    objectMetadataItemId,
    configuration,
  });

  const recordGqlFields = {
    [aggregateOperationFieldName]: true,
  };

  const query = generateAggregateQuery({
    objectMetadataItem,
    recordGqlFields,
  });

  const apolloCoreClient = useApolloCoreClient();

  const { data, loading, error, refetch } = useQuery(query, {
    client: apolloCoreClient,
    variables: filterQueryVariables,
  });

  const rawValue =
    data?.[objectMetadataItem.namePlural]?.[aggregateOperationFieldName];

  const value = useMemo(() => {
    if (aggregateField.type === FieldMetadataType.CURRENCY) {
      return convertCurrencyMicrosToCurrencyAmount(rawValue);
    }

    return Number(rawValue);
  }, [rawValue, aggregateField.type]);

  const format = aggregateField.settings?.format;

  const { formatNumber } = useNumberFormat();

  const formattedValue = useMemo(() => {
    if (!isDefined(format) || format === 'short') {
      return formatToShortNumber(value);
    }

    return formatNumber(value);
  }, [value, format, formatNumber]);

  return {
    value: formattedValue,
    loading,
    error,
    refetch,
  };
};
