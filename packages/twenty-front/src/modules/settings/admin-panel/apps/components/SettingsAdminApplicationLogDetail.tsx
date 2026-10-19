import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { Fragment } from 'react';
import { themeCssVariables } from 'twenty-ui/theme';

import { type AdminApplicationLogRecord } from '@/settings/admin-panel/apps/types/AdminApplicationLogRecord';

const StyledDetail = styled.div`
  background-color: ${themeCssVariables.background.secondary};
  border-radius: ${themeCssVariables.border.radius.md};
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
  margin-bottom: ${themeCssVariables.spacing[2]};
  padding: ${themeCssVariables.spacing[3]};
`;

const StyledFields = styled.div`
  color: ${themeCssVariables.font.color.secondary};
  column-gap: ${themeCssVariables.spacing[4]};
  display: grid;
  font-size: ${themeCssVariables.font.size.sm};
  grid-template-columns: max-content 1fr;
  row-gap: ${themeCssVariables.spacing[1]};
`;

const StyledFieldLabel = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
`;

const StyledCode = styled.pre`
  color: ${themeCssVariables.font.color.primary};
  font-family: ${themeCssVariables.code.font.family}, monospace;
  font-size: ${themeCssVariables.font.size.sm};
  margin: 0;
  overflow-x: auto;
  white-space: pre-wrap;
  word-break: break-word;
`;

type SettingsAdminApplicationLogDetailProps = {
  log: AdminApplicationLogRecord;
};

export const SettingsAdminApplicationLogDetail = ({
  log,
}: SettingsAdminApplicationLogDetailProps) => {
  const { t } = useLingui();

  const fields = [
    { label: t`Workspace ID`, value: log.properties?.workspaceId },
    { label: t`Version`, value: log.properties?.applicationVersion },
    { label: t`Source`, value: log.properties?.source },
    { label: t`Error code`, value: log.properties?.errorCode },
    { label: t`Execution`, value: log.properties?.executionId },
  ].filter(({ value }) => isNonEmptyString(value));

  const stackTrace = log.properties?.stackTrace;

  return (
    <StyledDetail>
      <StyledFields>
        {fields.map(({ label, value }) => (
          <Fragment key={label}>
            <StyledFieldLabel>{label}</StyledFieldLabel>
            <span>{value}</span>
          </Fragment>
        ))}
      </StyledFields>
      <StyledCode>{log.properties?.message}</StyledCode>
      {isNonEmptyString(stackTrace) && <StyledCode>{stackTrace}</StyledCode>}
    </StyledDetail>
  );
};
