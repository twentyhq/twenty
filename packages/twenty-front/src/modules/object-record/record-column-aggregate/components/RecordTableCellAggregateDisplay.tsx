import { useNumberFormat } from '@/localization/hooks/useNumberFormat';
import { dateLocaleState } from '@/localization/states/dateLocaleState';
import { RELATION_AGGREGATE_VALUES_RECORD_KEY } from '@/object-record/cache/constants/RelationAggregateValuesRecordKey';
import { transformAggregateRawValueIntoAggregateDisplayValue } from '@/object-record/record-aggregate/utils/transformAggregateRawValueIntoAggregateDisplayValue';
import { type RelationAggregateValues } from '@/object-record/record-column-aggregate/types/RelationAggregateValues';
import { type RecordFieldAggregateTarget } from '@/object-record/record-column-aggregate/utils/getRecordFieldAggregateTarget';
import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { ForbiddenFieldDisplay } from '@/object-record/record-field/ui/meta-types/display/components/ForbiddenFieldDisplay';
import { recordStoreFamilySelector } from '@/object-record/record-store/states/selectors/recordStoreFamilySelector';
import { useRecordTableRowContextOrThrow } from '@/object-record/record-table/contexts/RecordTableRowContext';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { UserContext } from '@/users/contexts/UserContext';
import { useContext } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { Text } from 'twenty-ui/primitives/typography';

type RecordTableCellAggregateDisplayProps = {
  aggregateTarget: RecordFieldAggregateTarget;
};

export const RecordTableCellAggregateDisplay = ({
  aggregateTarget,
}: RecordTableCellAggregateDisplayProps) => {
  const { recordId } = useRecordTableRowContextOrThrow();
  const { isForbidden } = useContext(FieldContext);
  const { dateFormat, timeFormat, timeZone } = useContext(UserContext);
  const dateLocale = useAtomStateValue(dateLocaleState);
  const { numberFormat } = useNumberFormat();

  const relationAggregateValues = useAtomFamilySelectorValue(
    recordStoreFamilySelector,
    { recordId, fieldName: RELATION_AGGREGATE_VALUES_RECORD_KEY },
  ) as RelationAggregateValues | undefined;

  if (isForbidden === true || !aggregateTarget.isAggregatedFieldReadable) {
    return <ForbiddenFieldDisplay />;
  }

  const aggregateRawValue =
    relationAggregateValues?.[aggregateTarget.relationFieldName]?.[
      aggregateTarget.aggregateGqlFieldName
    ];

  if (!isDefined(aggregateRawValue)) {
    return <Text truncate />;
  }

  return (
    <Text truncate>
      {transformAggregateRawValueIntoAggregateDisplayValue({
        aggregateFieldMetadataItem: aggregateTarget.aggregatedFieldMetadataItem,
        aggregateOperation: aggregateTarget.aggregateOperation,
        aggregateRawValue,
        dateFormat,
        timeFormat,
        timeZone,
        localeCatalog: dateLocale.localeCatalog,
        numberFormat,
      })}
    </Text>
  );
};
