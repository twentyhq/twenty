import { useMutation } from '@apollo/client/react';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useCallback, useState } from 'react';
import { isNonEmptyString } from '@sniptt/guards';
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
import { EventLogDatePickerInput } from '~/pages/settings/security/event-logs/components/EventLogDatePickerInput';

type MaintenanceFormState = {
  startAt: Date | undefined;
  endAt: Date | undefined;
  link: string;
};

const buildInitialFormState = (
  maintenanceMode: {
    startAt: string;
    endAt: string;
    link?: string | null;
  } | null,
): MaintenanceFormState => ({
  startAt: isDefined(maintenanceMode)
    ? new Date(maintenanceMode.startAt)
    : undefined,
  endAt: isDefined(maintenanceMode)
    ? new Date(maintenanceMode.endAt)
    : undefined,
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
      if (!isDefined(state.startAt) || !isDefined(state.endAt)) {
        return;
      }

      const startISO = state.startAt.toISOString();
      const endISO = state.endAt.toISOString();

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
        setFormState({ startAt: undefined, endAt: undefined, link: '' });
        setIsSaved(false);
      }
    },
    [clearMaintenanceModeMutation, setMaintenanceMode],
  );

  const handleDateChange = useCallback(
    (field: 'startAt' | 'endAt') => (value: Date | undefined) => {
      const nextState = { ...formState, [field]: value };

      setFormState(nextState);
      setIsSaved(false);
      saveMaintenanceMode(nextState);
    },
    [formState, saveMaintenanceMode],
  );

  const handleLinkChange = useCallback((value: string) => {
    setFormState((previous) => ({ ...previous, link: value }));
    setIsSaved(false);
  }, []);

  const handleLinkBlur = useCallback(() => {
    saveMaintenanceMode(formState);
  }, [formState, saveMaintenanceMode]);

  const isScheduled = isDefined(maintenanceMode);

  const formattedStartDate = isDefined(maintenanceMode)
    ? new Date(maintenanceMode.startAt).toLocaleDateString(undefined, {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric',
      })
    : '';

  const toggleDescription = isScheduled
    ? t`Planned for ${formattedStartDate}`
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
              <EventLogDatePickerInput
                label={t`Start date`}
                value={formState.startAt}
                onChange={handleDateChange('startAt')}
              />
              <EventLogDatePickerInput
                label={t`End date`}
                value={formState.endAt}
                onChange={handleDateChange('endAt')}
              />
              <TextInput
                label={t`Link`}
                type="url"
                value={formState.link}
                onChange={handleLinkChange}
                onBlur={handleLinkBlur}
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
                    text={t`Planned for ${formattedStartDate}`}
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
