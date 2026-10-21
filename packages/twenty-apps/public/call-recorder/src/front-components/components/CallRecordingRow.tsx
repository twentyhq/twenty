import styled from '@emotion/styled';
import { isNonEmptyString, isUndefined } from '@sniptt/guards';
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
  calendarEventId: string | undefined;
  title: string;
  formattedDate: string | undefined;
  formattedDuration: string | undefined;
  statusTag: CallRecordingStatusTag | undefined;
};

export const CallRecordingRow = ({
  callRecordingId,
  calendarEventId,
  title,
  formattedDate,
  formattedDuration,
  statusTag,
}: CallRecordingRowProps) => {
  const isClickable = isNonEmptyString(calendarEventId);

  const handleClick = () => {
    if (!isClickable) {
      return;
    }

    void openRecord({
      objectNameSingular: 'calendarEvent',
      recordId: calendarEventId,
    });
  };

  const chip = (
    <Chip
      label={title}
      clickable={isClickable}
      variant={isClickable ? ChipVariant.Highlighted : ChipVariant.Transparent}
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
  );

  return (
    <StyledCallRecordingRowLayout>
      {isClickable ? (
        <StyledChipButton type="button" onClick={handleClick}>
          {chip}
        </StyledChipButton>
      ) : (
        chip
      )}
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
