import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { Section } from 'twenty-ui/components/layout';
import { themeCssVariables } from 'twenty-ui/theme';

import { getPositionNumberIcon } from '@/object-record/record-merge/utils/getPositionNumberIcon';
import { getPositionWordLabel } from '@/object-record/record-merge/utils/getPositionWordLabel';
import { Select } from '@/ui/input/components/Select';

const MISSING_PRIORITY_RECORD_INDEX = -1;

const StyledSectionContainer = styled.div`
  padding: ${themeCssVariables.spacing[2]};
  width: auto;
`;

type MergePrioritySettingsProps = {
  selectedRecordCount: number;
  priorityRecordIndex: number;
  onPriorityRecordIndexChange: (index: number) => void;
  dropdownId: string;
  disabled?: boolean;
};

export const MergePrioritySettings = ({
  selectedRecordCount,
  priorityRecordIndex,
  onPriorityRecordIndexChange,
  dropdownId,
  disabled = false,
}: MergePrioritySettingsProps) => {
  const priorityOptions = Array.from(
    { length: selectedRecordCount },
    (_, index) => {
      const positionLabel = getPositionWordLabel(index);

      return {
        value: index,
        label: t`${positionLabel} record holds priority`,
        Icon: getPositionNumberIcon(index),
      };
    },
  );

  if (selectedRecordCount === 0) {
    return null;
  }

  return (
    <StyledSectionContainer>
      <Section.Root>
        <Select
          dropdownId={dropdownId}
          options={priorityOptions}
          value={priorityRecordIndex}
          emptyOption={{
            value: MISSING_PRIORITY_RECORD_INDEX,
            label: t`No record holds priority`,
          }}
          onChange={onPriorityRecordIndexChange}
          label={t`Fields conflicts`}
          disabled={disabled}
        />
      </Section.Root>
    </StyledSectionContainer>
  );
};
