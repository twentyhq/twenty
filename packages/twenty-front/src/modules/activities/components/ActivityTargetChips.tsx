import { useMemo } from 'react';
import styled from '@emotion/styled';
import { v4 } from 'uuid';

import { ActivityTargetWithTargetRecord } from '@/activities/types/ActivityTargetObject';
import { RecordChip } from '@/object-record/components/RecordChip';
import { Chip, ChipVariant } from '@/ui/display/chip/components/Chip';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { RGBA } from '@/ui/theme/constants/Rgba';

const MAX_RECORD_CHIPS_DISPLAY = 2;

const StyledContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing(1)};
`;

const StyledRelationsListContainer = styled(StyledContainer)`
  padding: ${({ theme }) => theme.spacing(2)};
  border-radius: ${({ theme }) => theme.spacing(1)};
  background-color: ${({ theme }) => RGBA(theme.color.gray10, 0.8)};
  box-shadow: '0px 2px 4px ${({ theme }) =>
    theme.boxShadow.light}, 2px 4px 16px ${({ theme }) =>
    theme.boxShadow.strong}';
  backdrop-filter: ${({ theme }) => theme.blur.strong};
`;

const showMoreRelationsHandler = (event?: React.MouseEvent<HTMLDivElement>) => {
  event?.preventDefault();
  event?.stopPropagation();
};

export const ActivityTargetChips = ({
  activityTargetObjectRecords,
}: {
  activityTargetObjectRecords: ActivityTargetWithTargetRecord[];
}) => {
  const dropdownId = useMemo(() => `multiple-relations-dropdown-${v4()}`, []);

  return (
    <StyledContainer>
      {activityTargetObjectRecords
        ?.slice(0, MAX_RECORD_CHIPS_DISPLAY)
        .map((activityTargetObjectRecord) => (
          <RecordChip
            key={activityTargetObjectRecord.targetObject.id}
            record={activityTargetObjectRecord.targetObject}
            objectNameSingular={
              activityTargetObjectRecord.targetObjectMetadataItem.nameSingular
            }
          />
        ))}

      {activityTargetObjectRecords.length > MAX_RECORD_CHIPS_DISPLAY && (
        <div onClick={showMoreRelationsHandler}>
          <Dropdown
            dropdownId={dropdownId}
            dropdownHotkeyScope={{
              scope: dropdownId,
            }}
            clickableComponent={
              <Chip
                label={`+${
                  activityTargetObjectRecords.length - MAX_RECORD_CHIPS_DISPLAY
                }`}
                variant={ChipVariant.Highlighted}
              />
            }
            dropdownOffset={{ x: 0, y: -20 }}
            dropdownComponents={
              <StyledRelationsListContainer>
                {activityTargetObjectRecords.map(
                  (activityTargetObjectRecord) => (
                    <RecordChip
                      key={activityTargetObjectRecord.targetObject.id}
                      record={activityTargetObjectRecord.targetObject}
                      objectNameSingular={
                        activityTargetObjectRecord.targetObjectMetadataItem
                          .nameSingular
                      }
                    />
                  ),
                )}
              </StyledRelationsListContainer>
            }
          />
        </div>
      )}
    </StyledContainer>
  );
};
