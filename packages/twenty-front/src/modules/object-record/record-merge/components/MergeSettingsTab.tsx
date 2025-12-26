import { t } from '@lingui/core/macro';
import { useMergeRecordsSelectedRecords } from '@/object-record/record-merge/hooks/useMergeRecordsSelectedRecords';
import { useMergeRecordsSettings } from '@/object-record/record-merge/hooks/useMergeRecordsSettings';
import { Select } from '@/ui/input/components/Select';
import styled from '@emotion/styled';
import { Section } from 'twenty-ui/layout';
import { getPositionNumberIcon } from '@/object-record/record-merge/utils/getPositionNumberIcon';
import { getPositionWordLabel } from '@/object-record/record-merge/utils/getPositionWordLabel';

const StyledSection = styled(Section)`
  margin: ${({ theme }) => theme.spacing(4)};
  width: auto;
`;

export const MergeSettingsTab = () => {
  const { mergeSettings, updatePriorityRecordIndex } =
    useMergeRecordsSettings();
  const { selectedRecords } = useMergeRecordsSelectedRecords();

  const priorityOptions = selectedRecords.map((_, index) => {
    const positionLabel = getPositionWordLabel(index);
    return {
      value: index,
      label: t`${positionLabel} record holds priority`,
      Icon: getPositionNumberIcon(index),
      recordIndex: index,
    };
  });

  const handleSelectionChange = (index: number) => {
    updatePriorityRecordIndex(index);
  };

  if (selectedRecords.length === 0) {
    return null;
  }

  return (
    <StyledSection>
      <Select
        dropdownId="merge-settings-priority-select"
        options={priorityOptions}
        value={mergeSettings.conflictPriorityIndex}
        onChange={handleSelectionChange}
        label={t`Fields conflicts`}
      />
    </StyledSection>
  );
};
