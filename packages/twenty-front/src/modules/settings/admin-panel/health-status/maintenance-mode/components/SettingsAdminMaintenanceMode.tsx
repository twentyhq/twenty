import { useMutation } from '@apollo/client/react';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useCallback, useState } from 'react';
import { isNonEmptyString } from '@sniptt/guards';
import { Temporal } from 'temporal-polyfill';
import { isDefined } from 'twenty-shared/utils';
import { H2Title, IconLink, IconTool, Status } from 'twenty-ui/display';
import { Card, CardContent, Section } from 'twenty-ui/layout';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { maintenanceModeState } from '@/client-config/states/maintenanceModeState';
import { CLEAR_MAINTENANCE_MODE } from '@/settings/admin-panel/health-status/maintenance-mode/graphql/mutations/clearMaintenanceMode';
import { SET_MAINTENANCE_MODE } from '@/settings/admin-panel/health-status/maintenance-mode/graphql/mutations/setMaintenanceMode';
import { SettingsOptionCardContentToggle } from '@/settings/components/SettingsOptions/SettingsOptionCardContentToggle';
import { TextInput } from '@/ui/input/components/TextInput';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';

type MaintenanceFormState = {
  startAt: string;
  endAt: string;
  link: string;
};

const isoToDatetimeLocal = (isoString: string): string => {
  const instant = Temporal.Instant.from(isoString);
  const utcDateTime = instant.toZonedDateTimeISO('UTC');

  return utcDateTime.toPlainDateTime().toString().slice(0, 16);
};

const datetimeLocalToISO = (localValue: string): string => {
  const plainDateTime = Temporal.PlainDateTime.from(localValue);
  const zonedDateTime = plainDateTime.toZonedDateTime('UTC');

  return zonedDateTime.toInstant().toString();
};

const formatDisplayDate = (isoString: string): string => {
  const instant = Temporal.Instant.from(isoString);
  const utcDateTime = instant.toZonedDateTimeISO('UTC');

  return utcDateTime.toLocaleString(undefined, {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
  });
};

const buildInitialFormState = (
  maintenanceMode: { startAt: string; endAt: string; link?: string | null } | null,
): MaintenanceFormState => ({
  startAt: isDefined(maintenanceMode)
    ? isoToDatetimeLocal(maintenanceMode.startAt)
    : '',
  endAt: isDefined(maintenanceMode)
    ? isoToDatetimeLocal(maintenanceMode.endAt)
    : '',
  link: maintenanceMode?.link ?? '',
});

const StyledFormContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[4]};
`;

const StyledHint = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.xs};
  margin-top: -${themeCssVariables.spacing[2]};
`;

const StyledStatusRow = styled.div`
  display: flex;
  justify-content: flex-end;
`;

export const SettingsAdminMaintenanceMode = () => {
  const maintenanceMode = useAtomStateValue(maintenanceModeState);
  const setMaintenanceMode = useSetAtomState(maintenanceModeState);

  const [isEnabled, setIsEnabled] = useState(isDefined(maintenanceMode));
  const [formState, setFormState] = useState<MaintenanceFormState>(
    buildInitialFormState(maintenanceMode),
  );
  const [isSaved, setIsSaved] = useState(isDefined(maintenanceMode));

  const [setMaintenanceModeMutation] = useMutation(SET_MAINTENANCE_MODE);
  const [clearMaintenanceModeMutation] = useMutation(CLEAR_MAINTENANCE_MODE);

  const saveMaintenanceMode = useCallback(
    async (state: MaintenanceFormState) => {
      if (
        !isNonEmptyString(state.startAt) ||
        !isNonEmptyString(state.endAt)
      ) {
        return;
      }

      const startISO = datetimeLocalToISO(state.startAt);
      const endISO = datetimeLocalToISO(state.endAt);

      await setMaintenanceModeMutation({
        variables: {
          startAt: startISO,
          endAt: endISO,
          link: isNonEmptyString(state.link) ? state.link : undefined,
        },
      });

      setMaintenanceMode({
        __typename: 'ClientConfigMaintenanceMode',
        startAt: startISO,
        endAt: endISO,
        link: isNonEmptyString(state.link) ? state.link : undefined,
      });

      setIsSaved(true);
    },
    [setMaintenanceModeMutation, setMaintenanceMode],
  );

  const handleToggle = useCallback(
    async (checked: boolean) => {
      setIsEnabled(checked);

      if (!checked) {
        await clearMaintenanceModeMutation();
        setMaintenanceMode(null);
        setFormState({ startAt: '', endAt: '', link: '' });
        setIsSaved(false);
      }
    },
    [clearMaintenanceModeMutation, setMaintenanceMode],
  );

  const handleFieldChange = useCallback(
    (field: keyof MaintenanceFormState) => (value: string) => {
      setFormState((previous) => ({ ...previous, [field]: value }));
      setIsSaved(false);
    },
    [],
  );

  const handleFieldBlur = useCallback(() => {
    saveMaintenanceMode(formState);
  }, [formState, saveMaintenanceMode]);

  const isScheduled = isDefined(maintenanceMode);
  const toggleDescription = isScheduled
    ? t`Planned for ${formatDisplayDate(maintenanceMode.startAt)}`
    : undefined;

  return (
    <Section>
      <H2Title
        title={t`Maintenance`}
        description={t`Schedule a maintenance window and notify all users`}
      />
      <Card rounded>
        <SettingsOptionCardContentToggle
          Icon={IconTool}
          title={t`Maintenance mode`}
          description={toggleDescription}
          checked={isEnabled}
          onChange={handleToggle}
        />
        {isEnabled && (
          <CardContent>
            <StyledFormContainer>
              <TextInput
                label={t`Start date`}
                type="datetime-local"
                value={formState.startAt}
                onChange={handleFieldChange('startAt')}
                onBlur={handleFieldBlur}
                rightAdornment="UTC"
                fullWidth
              />
              <TextInput
                label={t`End date`}
                type="datetime-local"
                value={formState.endAt}
                onChange={handleFieldChange('endAt')}
                onBlur={handleFieldBlur}
                rightAdornment="UTC"
                fullWidth
              />
              <TextInput
                label={t`Link`}
                type="url"
                value={formState.link}
                onChange={handleFieldChange('link')}
                onBlur={handleFieldBlur}
                LeftIcon={IconLink}
                placeholder="https://status.example.com"
                fullWidth
              />
              <StyledHint>
                {t`If there's no link, no button will appear.`}
              </StyledHint>
              {isScheduled && isSaved && (
                <StyledStatusRow>
                  <Status
                    color="orange"
                    text={t`Planned for ${formatDisplayDate(maintenanceMode.startAt)}`}
                  />
                </StyledStatusRow>
              )}
            </StyledFormContainer>
          </CardContent>
        )}
      </Card>
    </Section>
  );
};
