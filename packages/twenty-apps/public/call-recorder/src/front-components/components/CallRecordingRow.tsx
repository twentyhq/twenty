import styled from '@emotion/styled';
import { isUndefined } from '@sniptt/guards';
import { Tag } from 'twenty-ui/data-display';
import { IconCalendar, IconClock, IconVideo } from 'twenty-ui/icon';
import { ICON } from 'twenty-ui/theme';
import { themeCssVariables } from 'twenty-ui/theme-constants';

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

// Mirrors Twenty's FileIcon tile, in the VIDEO file category color.
const StyledVideoTile = styled.span`
  align-items: center;
  background: ${() => themeCssVariables.color.purple};
  border-radius: ${() => themeCssVariables.border.radius.sm};
  color: ${() => themeCssVariables.grayScale.gray1};
  display: flex;
  flex-shrink: 0;
  justify-content: center;
  padding: 5px;
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

const StyledMetadata = styled.span`
  align-items: center;
  display: flex;
  gap: ${() => themeCssVariables.spacing['0.5']};
`;

const StyledMetadataIconContainer = styled.span`
  align-items: center;
  color: ${() => themeCssVariables.font.color.light};
  display: flex;
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
    <StyledRowButton type="button" aria-label={title} onClick={handleClick}>
      <StyledVideoTile>
        <IconVideo size={ICON.size.sm} stroke={ICON.stroke.sm} />
      </StyledVideoTile>
      <StyledTitle title={title}>{title}</StyledTitle>
      <StyledRightContent>
        {!isUndefined(statusTag) ? (
          <Tag color={statusTag.color} text={statusTag.text} />
        ) : (
          !isUndefined(formattedDuration) && (
            <StyledMetadata>
              <StyledMetadataIconContainer>
                <IconClock size={ICON.size.md} />
              </StyledMetadataIconContainer>
              {formattedDuration}
            </StyledMetadata>
          )
        )}
        {!isUndefined(formattedDate) && (
          <StyledMetadata>
            <StyledMetadataIconContainer>
              <IconCalendar size={ICON.size.md} />
            </StyledMetadataIconContainer>
            {formattedDate}
          </StyledMetadata>
        )}
      </StyledRightContent>
    </StyledRowButton>
  );
};
