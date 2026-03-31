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
import { CLEAR_MAINTENANCE_MODE } from '@/settings/admin-panel/health-status/graphql/mutations/clearMaintenanceMode';
import { SET_MAINTENANCE_MODE } from '@/settings/admin-panel/health-status/graphql/mutations/setMaintenanceMode';
import { SettingsOptionCardContentToggle } from '@/settings/components/SettingsOptions/SettingsOptionCardContentToggle';
import { TextInput } from '@/ui/input/components/TextInput';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';

const toDateValue = (isoString: string): string => isoString.slice(0, 10);

const fromDateToISO = (dateValue: string): string =>
  new Date(dateValue + 'T00:00:00Z').toISOString();

const formatDisplayDate = (isoString: string): string =>
  new Date(isoString).toLocaleDateString(undefined, {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
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
  const [startAt, setStartAt] = useState(
    isDefined(maintenanceMode) ? toDateValue(maintenanceMode.startAt) : '',
  );
  const [endAt, setEndAt] = useState(
    isDefined(maintenanceMode) ? toDateValue(maintenanceMode.endAt) : '',
  );
  const [link, setLink] = useState(maintenanceMode?.link ?? '');

  const [setMaintenanceModeMutation] = useMutation(SET_MAINTENANCE_MODE);
  const [clearMaintenanceModeMutation] = useMutation(CLEAR_MAINTENANCE_MODE);

  const saveMaintenanceMode = useCallback(
    async (startDate: string, endDate: string, linkValue: string) => {
      if (!isNonEmptyString(startDate) || !isNonEmptyString(endDate)) {
        return;
      }

      const startISO = fromDateToISO(startDate);
      const endISO = fromDateToISO(endDate);

      await setMaintenanceModeMutation({
        variables: {
          startAt: startISO,
          endAt: endISO,
          link: isNonEmptyString(linkValue) ? linkValue : undefined,
        },
      });

      setMaintenanceMode({
        __typename: 'ClientConfigMaintenanceMode',
        startAt: startISO,
        endAt: endISO,
        link: isNonEmptyString(linkValue) ? linkValue : undefined,
      });
    },
    [setMaintenanceModeMutation, setMaintenanceMode],
  );

  const handleToggle = useCallback(
    async (checked: boolean) => {
      setIsEnabled(checked);

      if (!checked) {
        await clearMaintenanceModeMutation();
        setMaintenanceMode(null);
        setStartAt('');
        setEndAt('');
        setLink('');
      } else if (isNonEmptyString(startAt) && isNonEmptyString(endAt)) {
        await saveMaintenanceMode(startAt, endAt, link);
      }
    },
    [
      clearMaintenanceModeMutation,
      setMaintenanceMode,
      startAt,
      endAt,
      link,
      saveMaintenanceMode,
    ],
  );

  const handleStartAtChange = useCallback(
    (value: string) => {
      setStartAt(value);

      if (isNonEmptyString(value) && isNonEmptyString(endAt)) {
        saveMaintenanceMode(value, endAt, link);
      }
    },
    [endAt, link, saveMaintenanceMode],
  );

  const handleEndAtChange = useCallback(
    (value: string) => {
      setEndAt(value);

      if (isNonEmptyString(startAt) && isNonEmptyString(value)) {
        saveMaintenanceMode(startAt, value, link);
      }
    },
    [startAt, link, saveMaintenanceMode],
  );

  const handleLinkBlur = useCallback(() => {
    if (isNonEmptyString(startAt) && isNonEmptyString(endAt)) {
      saveMaintenanceMode(startAt, endAt, link);
    }
  }, [startAt, endAt, link, saveMaintenanceMode]);

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
                type="date"
                value={startAt}
                onChange={handleStartAtChange}
                rightAdornment="UTC"
                fullWidth
              />
              <TextInput
                label={t`End date`}
                type="date"
                value={endAt}
                onChange={handleEndAtChange}
                rightAdornment="UTC"
                fullWidth
              />
              <TextInput
                label={t`Link`}
                type="url"
                value={link}
                onChange={setLink}
                onBlur={handleLinkBlur}
                LeftIcon={IconLink}
                placeholder="https://status.example.com"
                fullWidth
              />
              <StyledHint>
                {t`If there's no link, no button will appear.`}
              </StyledHint>
              {isScheduled && (
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
