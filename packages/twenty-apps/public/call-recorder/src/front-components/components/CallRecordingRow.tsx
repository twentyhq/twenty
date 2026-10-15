import styled from '@emotion/styled';
import { isUndefined } from '@sniptt/guards';
import { IconCalendar, IconVideo } from 'twenty-ui/icon';
import { ICON } from 'twenty-ui/theme';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { CallRecordingRowMetadata } from 'src/front-components/components/CallRecordingRowMetadata';
import { CallRecordingRowStatus } from 'src/front-components/components/CallRecordingRowStatus';
import { StyledCallRecordingRowLayout } from 'src/front-components/components/StyledCallRecordingRowLayout';
import { type CallRecordingStatusTag } from 'src/front-components/types/call-recording-status-tag.type';
import { openRecord } from 'src/front-components/utils/open-record.util';

const StyledRowButton = styled(
  StyledCallRecordingRowLayout.withComponent('button'),
)`
  appearance: none;
  background: none;
  border: none;
  border-radius: 0;
  color: inherit;
  cursor: pointer;
  font-family: inherit;
  font-size: ${() => themeCssVariables.font.size.md};
  text-align: left;

  &:hover {
    background: ${() => themeCssVariables.background.transparent.lighter};
  }

  &:focus-visible {
    outline: 2px solid ${() => themeCssVariables.color.blue};
    outline-offset: -2px;
  }
`;

const StyledVideoTile = styled.span`
  align-items: center;
  background: ${() => themeCssVariables.color.purple};
  border-radius: ${() => themeCssVariables.border.radius.sm};
  color: ${() => themeCssVariables.grayScale.gray1};
  display: flex;
  flex-shrink: 0;
  height: ${() => themeCssVariables.spacing[6]};
  justify-content: center;
  width: ${() => themeCssVariables.spacing[6]};
`;

const StyledTitle = styled.span`
  color: ${() => themeCssVariables.font.color.primary};
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledRightContent = styled.span`
  align-items: center;
  display: flex;
  flex-shrink: 0;
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
    <StyledRowButton type="button" onClick={handleClick}>
      <StyledVideoTile>
        <IconVideo size={ICON.size.sm} stroke={ICON.stroke.sm} />
      </StyledVideoTile>
      <StyledTitle title={title}>{title}</StyledTitle>
      <StyledRightContent>
        <CallRecordingRowStatus
          statusTag={statusTag}
          formattedDuration={formattedDuration}
        />
        {!isUndefined(formattedDate) && (
          <CallRecordingRowMetadata Icon={IconCalendar} text={formattedDate} />
        )}
      </StyledRightContent>
    </StyledRowButton>
  );
};
