import { ConditionalAvailabilityRecordMultipleSelect } from '@/conditional-availability/components/ConditionalAvailabilityRecordMultipleSelect';
import { ConditionalAvailabilityRecordSingleSelect } from '@/conditional-availability/components/ConditionalAvailabilityRecordSingleSelect';
import { ConditionalAvailabilityValueControl } from '@/conditional-availability/components/ConditionalAvailabilityValueControl';
import { useConditionalAvailabilityEditorContext } from '@/conditional-availability/contexts/ConditionalAvailabilityEditorContext';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { getObjectRecordIdentifier } from '@/object-metadata/utils/getObjectRecordIdentifier';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { useLingui } from '@lingui/react/macro';
import { QUERY_MAX_RECORDS } from 'twenty-shared/constants';
import { isDefined, isNonEmptyArray, isValidUuid } from 'twenty-shared/utils';

type ConditionalAvailabilityRecordSelectProps = {
  dropdownId: string;
  objectNameSingular: string;
  values: string[];
  isMultiple: boolean;
  onChange: (values: string[]) => void;
};

export const ConditionalAvailabilityRecordSelect = ({
  dropdownId,
  objectNameSingular,
  values,
  isMultiple,
  onChange,
}: ConditionalAvailabilityRecordSelectProps) => {
  const { t } = useLingui();
  const { isReadOnly } = useConditionalAvailabilityEditorContext();
  const { objectMetadataItem } = useObjectMetadataItem({ objectNameSingular });

  const recordIds = values.filter((value) => isValidUuid(value));

  const { records, loading } = useFindManyRecords({
    objectNameSingular,
    filter: { id: { in: recordIds } },
    limit: Math.min(recordIds.length, QUERY_MAX_RECORDS),
    skip: !isNonEmptyArray(recordIds),
    withSoftDeleted: true,
  });

  const getValueLabel = (value: string) => {
    const record = records.find((candidate) => candidate.id === value);

    return isDefined(record)
      ? getObjectRecordIdentifier({
          objectMetadataItem,
          record,
          allowRequestsToTwentyIcons: false,
        }).name
      : t`Unknown record`;
  };

  const control = (
    <ConditionalAvailabilityValueControl
      labels={loading ? [] : values.map(getValueLabel)}
      placeholder={isMultiple ? t`Select records` : t`Select a record`}
      isDisabled={isReadOnly}
    />
  );

  if (isReadOnly) {
    return control;
  }

  return isMultiple ? (
    <ConditionalAvailabilityRecordMultipleSelect
      dropdownId={dropdownId}
      objectNameSingular={objectNameSingular}
      control={control}
      values={values}
      selectedRecords={records}
      onChange={onChange}
    />
  ) : (
    <ConditionalAvailabilityRecordSingleSelect
      dropdownId={dropdownId}
      objectNameSingular={objectNameSingular}
      control={control}
      value={values[0] ?? null}
      onChange={onChange}
    />
  );
};
