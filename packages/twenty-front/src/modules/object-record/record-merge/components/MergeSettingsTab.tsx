import { useMergeRecordsSettings } from '@/object-record/record-merge/hooks/useMergeRecordsSettings';
import { Select } from '@/ui/input/components/Select';
import styled from '@emotion/styled';
import { Section } from 'twenty-ui/layout';
import { getPositionNumberIcon } from '../utils/getPositionNumberIcon';
import { getPositionWordLabel } from '../utils/getPositionWordLabel';

const StyledSection = styled(Section)`
  margin: ${({ theme }) => theme.spacing(4)};
`;

export const MergeSettingsTab = () => {
  const { mergeSettings, updatePriorityRecordIndex, selectedRecords } =
    useMergeRecordsSettings();

  const priorityOptions = selectedRecords.map((_, index) => ({
    value: index,
    label: `${getPositionWordLabel(index)} record holds priority`,
    Icon: getPositionNumberIcon(index),
    recordIndex: index,
  }));

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
        label="Fields conflicts"
      />
    </StyledSection>
  );
};
