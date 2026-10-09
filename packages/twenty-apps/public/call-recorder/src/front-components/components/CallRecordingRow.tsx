import styled from '@emotion/styled';
import { AppPath, navigate } from 'twenty-sdk/front-component';
import { IconVideo } from 'twenty-ui/icon';
import { ICON } from 'twenty-ui/theme';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledRowButton = styled.button`
  align-items: center;
  background: none;
  border: none;
  border-radius: ${() => themeCssVariables.border.radius.sm};
  box-sizing: border-box;
  color: ${() => themeCssVariables.font.color.primary};
  cursor: pointer;
  display: flex;
  font-family: inherit;
  font-size: ${() => themeCssVariables.font.size.md};
  gap: ${() => themeCssVariables.spacing[2]};
  padding: ${() => themeCssVariables.spacing[1]}
    ${() => themeCssVariables.spacing[2]};
  text-align: left;
  width: 100%;

  &:hover {
    background: ${() => themeCssVariables.background.transparent.light};
  }

  &:focus-visible {
    outline: 1px solid ${() => themeCssVariables.border.color.blue};
  }
`;

const StyledIconContainer = styled.span`
  color: ${() => themeCssVariables.font.color.tertiary};
  display: flex;
  flex-shrink: 0;
`;

const StyledTitle = styled.span`
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledDate = styled.span`
  color: ${() => themeCssVariables.font.color.tertiary};
  flex-shrink: 0;
  white-space: nowrap;
`;

type CallRecordingRowProps = {
  callRecordingId: string;
  title: string;
  formattedDate: string | undefined;
};

export const CallRecordingRow = ({
  callRecordingId,
  title,
  formattedDate,
}: CallRecordingRowProps) => {
  const handleClick = () => {
    void navigate(AppPath.RecordShowPage, {
      objectNameSingular: 'callRecording',
      objectRecordId: callRecordingId,
    });
  };

  return (
    <StyledRowButton type="button" title={title} onClick={handleClick}>
      <StyledIconContainer>
        <IconVideo size={ICON.size.md} stroke={ICON.stroke.md} />
      </StyledIconContainer>
      <StyledTitle>{title}</StyledTitle>
      {formattedDate && <StyledDate>{formattedDate}</StyledDate>}
    </StyledRowButton>
  );
};
