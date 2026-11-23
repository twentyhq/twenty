import { recordGroupDefinitionFamilyState } from '@/object-record/record-group/states/recordGroupDefinitionFamilyState';
import { recordIndexAggregateDisplayValueForGroupValueComponentFamilyState } from '@/object-record/record-index/states/recordIndexAggregateDisplayValueForGroupValueComponentFamilyState';
import { useAtomComponentFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyStateValue';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { isDefined } from 'twenty-shared/utils';

type RecordGroupCountProps = {
  recordGroupId: string;
};

export const RecordGroupCount = ({ recordGroupId }: RecordGroupCountProps) => {
  const recordGroupDefinition = useAtomFamilyStateValue(
    recordGroupDefinitionFamilyState,
    recordGroupId,
  );

  const recordIndexAggregateDisplayValueForGroupValue =
    useAtomComponentFamilyStateValue(
      recordIndexAggregateDisplayValueForGroupValueComponentFamilyState,
      { groupValue: recordGroupDefinition?.value ?? '' },
    );

  return isDefined(recordIndexAggregateDisplayValueForGroupValue)
    ? recordIndexAggregateDisplayValueForGroupValue
    : '-';
};
