import styled from '@emotion/styled';
import { isUndefined } from '@sniptt/guards';
import { getPublicAssetUrl } from 'twenty-sdk/utils';
import { Avatar, Chip, ChipVariant } from 'twenty-ui/data-display';
import { IconCalendar } from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { CallRecordingRowMetadata } from 'src/front-components/components/CallRecordingRowMetadata';
import { CallRecordingRowStatus } from 'src/front-components/components/CallRecordingRowStatus';
import { StyledCallRecordingRowLayout } from 'src/front-components/components/StyledCallRecordingRowLayout';
import { StyledChipButton } from 'src/front-components/components/StyledChipButton';
import { type CallRecordingStatusTag } from 'src/front-components/types/call-recording-status-tag.type';
import { openRecord } from 'src/front-components/utils/open-record.util';

const StyledRightContent = styled.span`
  align-items: center;
  color: ${() => themeCssVariables.font.color.secondary};
  display: flex;
  flex-shrink: 0;
  font-size: ${() => themeCssVariables.font.size.md};
  gap: ${() => themeCssVariables.spacing[2]};
  white-space: nowrap;
`;

type CallRecordingRowProps = {
  callRecordingId: string;
  title: string;
  formattedDate: string | undefined;
  formattedDuration: string | undefined;
  statusTag: CallRecordingStatusTag | undefined;
};

export const CallRecordingRow = ({
  callRecordingId,
  title,
  formattedDate,
  formattedDuration,
  statusTag,
}: CallRecordingRowProps) => {
  const handleClick = () => {
    void openRecord({
      objectNameSingular: 'callRecording',
      recordId: callRecordingId,
    });
  };

  return (
    <StyledCallRecordingRowLayout>
      <StyledChipButton type="button" onClick={handleClick}>
        <Chip
          label={title}
          clickable
          variant={ChipVariant.Highlighted}
          leftComponent={
            <Avatar
              avatarUrl={getPublicAssetUrl('logo.svg')}
              placeholder={title}
              placeholderColorSeed={callRecordingId}
              type="rounded"
              size="sm"
            />
          }
        />
      </StyledChipButton>
      <StyledRightContent>
        <CallRecordingRowStatus
          statusTag={statusTag}
          formattedDuration={formattedDuration}
        />
        {!isUndefined(formattedDate) && (
          <CallRecordingRowMetadata Icon={IconCalendar} text={formattedDate} />
        )}
      </StyledRightContent>
    </StyledCallRecordingRowLayout>
  );
};
