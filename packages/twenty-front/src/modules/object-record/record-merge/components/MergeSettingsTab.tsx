import { MergeManySettings } from '@/object-record/hooks/useMergeManyRecords';
import {
  getPositionNumberIcon,
  getPositionWordLabel,
} from '@/object-record/record-merge/utils/recordMergeUtils';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { Select } from '@/ui/input/components/Select';
import styled from '@emotion/styled';
import { Section } from 'twenty-ui/layout';

type MergeSettingsTabProps = {
  selectedRecords: ObjectRecord[];
  mergeSettings: MergeManySettings;
  onMergeSettingsChange: (settings: MergeManySettings) => void;
};

const StyledSection = styled(Section)`
  margin: ${({ theme }) => theme.spacing(4)};
`;

export const MergeSettingsTab = ({
  selectedRecords,
  mergeSettings,
  onMergeSettingsChange,
}: MergeSettingsTabProps) => {
  const priorityOptions = selectedRecords.map((_, index) => ({
    value: index,
    label: `${getPositionWordLabel(index)} record holds priority`,
    Icon: getPositionNumberIcon(index),
    recordIndex: index,
  }));

  const handleSelectionChange = (index: number) => {
    onMergeSettingsChange({
      ...mergeSettings,
      priorityRecordIndex: index,
    });
  };

  return (
    <StyledSection>
      <Select
        dropdownId="merge-settings-priority-select"
        options={priorityOptions}
        value={mergeSettings.priorityRecordIndex}
        onChange={handleSelectionChange}
        label="Fields conflicts"
      />
    </StyledSection>
  );
};
