import { useNumberFormat } from '@/localization/hooks/useNumberFormat';
import { dateLocaleState } from '@/localization/states/dateLocaleState';
import { getRelationAggregateRecordKey } from '@/object-record/cache/utils/getRelationAggregateRecordKey';
import { transformAggregateRawValueIntoAggregateDisplayValue } from '@/object-record/record-aggregate/utils/transformAggregateRawValueIntoAggregateDisplayValue';
import { type RecordFieldSummary } from '@/object-record/record-column-summary/types/RecordFieldSummary';
import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { useRecordFieldValue } from '@/object-record/record-store/hooks/useRecordFieldValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { UserContext } from '@/users/contexts/UserContext';
import { useContext } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { OverflowingTextWithTooltip } from 'twenty-ui/primitives/typography';

type ScopedRelationSummaryFieldDisplayProps = {
  responseKey: string;
  summary: RecordFieldSummary;
};

export const ScopedRelationSummaryFieldDisplay = ({
  responseKey,
  summary,
}: ScopedRelationSummaryFieldDisplayProps) => {
  const { recordId, fieldDefinition } = useContext(FieldContext);
  const { dateFormat, timeFormat, timeZone } = useContext(UserContext);
  const dateLocale = useAtomStateValue(dateLocaleState);
  const { numberFormat } = useNumberFormat();

  const aggregateRawValue = useRecordFieldValue<string | number | null>(
    recordId,
    getRelationAggregateRecordKey({
      relationRecordKey: responseKey,
      aggregateGqlFieldName: summary.aggregateGqlFieldName,
    }),
    fieldDefinition,
  );

  // A sum or an average over no related records has no value to show
  if (!isDefined(aggregateRawValue)) {
    return null;
  }

  return (
    <OverflowingTextWithTooltip
      text={transformAggregateRawValueIntoAggregateDisplayValue({
        aggregateFieldMetadataItem: summary.aggregatedFieldMetadataItem,
        aggregateOperation: summary.aggregateOperation,
        aggregateRawValue,
        dateFormat,
        timeFormat,
        timeZone,
        localeCatalog: dateLocale.localeCatalog,
        numberFormat,
      })}
    />
  );
};
