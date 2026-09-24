import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme';

const SHORT_ID_LENGTH = 8;

const StyledShortId = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
  font-family: ${themeCssVariables.code.font.family};
`;

type SettingsLogsShortIdCellProps = {
  id: string;
};

export const SettingsLogsShortIdCell = ({
  id,
}: SettingsLogsShortIdCellProps) => (
  <StyledShortId>{id.slice(0, SHORT_ID_LENGTH)}</StyledShortId>
);
