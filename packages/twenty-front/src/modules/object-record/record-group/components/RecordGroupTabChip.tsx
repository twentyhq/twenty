import { RecordGroupChip } from '@/object-record/record-group/components/RecordGroupChip';
import { ALL_RECORD_GROUPS_TAB_ID } from '@/object-record/record-group/constants/AllRecordGroupsTabId';
import { recordGroupDefinitionFamilyState } from '@/object-record/record-group/states/recordGroupDefinitionFamilyState';
import { recordIndexGroupFieldMetadataItemComponentState } from '@/object-record/record-index/states/recordIndexGroupFieldMetadataComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { Tag } from 'twenty-ui/primitives/data-display';

type RecordGroupTabChipProps = {
  recordGroupTabId: string;
};

export const RecordGroupTabChip = ({
  recordGroupTabId,
}: RecordGroupTabChipProps) => {
  const { t } = useLingui();

  const recordGroupDefinition = useAtomFamilyStateValue(
    recordGroupDefinitionFamilyState,
    recordGroupTabId,
  );

  const recordIndexGroupFieldMetadataItem = useAtomComponentStateValue(
    recordIndexGroupFieldMetadataItemComponentState,
  );

  if (recordGroupTabId === ALL_RECORD_GROUPS_TAB_ID) {
    return (
      <Tag
        variant="outline"
        borderStyle="dashed"
        color="transparent"
        weight="medium"
      >
        {t`All`}
      </Tag>
    );
  }

  if (!isDefined(recordGroupDefinition)) {
    return null;
  }

  return (
    <RecordGroupChip
      recordGroupDefinition={recordGroupDefinition}
      fieldMetadataItem={recordIndexGroupFieldMetadataItem}
      valueTagWeight="medium"
    />
  );
};
