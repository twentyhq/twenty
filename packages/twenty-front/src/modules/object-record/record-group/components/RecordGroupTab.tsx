import { RecordGroupChip } from '@/object-record/record-group/components/RecordGroupChip';
import { recordGroupDefinitionFamilyState } from '@/object-record/record-group/states/recordGroupDefinitionFamilyState';
import { recordIndexAggregateDisplayValueForGroupValueComponentFamilyState } from '@/object-record/record-index/states/recordIndexAggregateDisplayValueForGroupValueComponentFamilyState';
import { recordIndexGroupFieldMetadataItemComponentState } from '@/object-record/record-index/states/recordIndexGroupFieldMetadataComponentState';
import { useAtomComponentFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyStateValue';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { isDefined } from 'twenty-shared/utils';
import { Tabs } from 'twenty-ui/primitives/navigation';

type RecordGroupTabProps = {
  recordGroupId: string;
};

export const RecordGroupTab = ({ recordGroupId }: RecordGroupTabProps) => {
  const recordGroupDefinition = useAtomFamilyStateValue(
    recordGroupDefinitionFamilyState,
    recordGroupId,
  );

  const recordIndexGroupFieldMetadataItem = useAtomComponentStateValue(
    recordIndexGroupFieldMetadataItemComponentState,
  );

  const recordIndexAggregateDisplayValueForGroupValue =
    useAtomComponentFamilyStateValue(
      recordIndexAggregateDisplayValueForGroupValueComponentFamilyState,
      { groupValue: recordGroupDefinition?.value ?? '' },
    );

  if (!isDefined(recordGroupDefinition)) {
    return null;
  }

  return (
    <Tabs.Tab
      variant="filled"
      value={recordGroupId}
      badge={
        isDefined(recordIndexAggregateDisplayValueForGroupValue)
          ? recordIndexAggregateDisplayValueForGroupValue
          : '-'
      }
    >
      <RecordGroupChip
        recordGroupDefinition={recordGroupDefinition}
        fieldMetadataItem={recordIndexGroupFieldMetadataItem}
        valueTagWeight="medium"
      />
    </Tabs.Tab>
  );
};
