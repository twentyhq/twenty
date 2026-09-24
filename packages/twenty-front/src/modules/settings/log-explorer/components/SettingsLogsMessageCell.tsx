import { styled } from '@linaria/react';
import { plural } from '@lingui/core/macro';
import { Pill } from 'twenty-ui/primitives/data-display';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledMessage = styled.span`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  min-width: 0;
`;

const StyledFirstLine = styled.span`
  color: ${themeCssVariables.font.color.primary};
  font-family: ${themeCssVariables.code.font.family};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledOtherLinesPill = styled(Pill)`
  flex-shrink: 0;
  white-space: nowrap;
`;

type SettingsLogsMessageCellProps = {
  message: string;
};

export const SettingsLogsMessageCell = ({
  message,
}: SettingsLogsMessageCellProps) => {
  const [firstLine, ...otherLines] = message.split('\n');

  return (
    <StyledMessage>
      <StyledFirstLine>{firstLine}</StyledFirstLine>
      {otherLines.length > 0 && (
        <StyledOtherLinesPill
          label={plural(otherLines.length, {
            one: '+# line',
            other: '+# lines',
          })}
        />
      )}
    </StyledMessage>
  );
};
