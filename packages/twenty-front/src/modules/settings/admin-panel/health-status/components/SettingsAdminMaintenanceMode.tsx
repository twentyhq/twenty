import { useMutation, useQuery } from '@apollo/client/react';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useCallback, useRef, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { isNonEmptyString } from '@sniptt/guards';
import { H2Title, Status } from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import { Card, CardContent, Section } from 'twenty-ui/layout';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { CLEAR_MAINTENANCE_MODE } from '@/settings/admin-panel/health-status/graphql/mutations/clearMaintenanceMode';
import { SET_MAINTENANCE_MODE } from '@/settings/admin-panel/health-status/graphql/mutations/setMaintenanceMode';
import {
  GET_MAINTENANCE_MODE,
  type GetMaintenanceModeResult,
} from '@/settings/admin-panel/health-status/graphql/queries/getMaintenanceMode';

const StyledFormRow = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  padding: ${themeCssVariables.spacing[2]} 0;
`;

const StyledLabel = styled.label`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.sm};
  min-width: 80px;
`;

const StyledInput = styled.input`
  background: ${themeCssVariables.background.transparent.lighter};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.sm};
  color: ${themeCssVariables.font.color.primary};
  font-family: inherit;
  font-size: ${themeCssVariables.font.size.sm};
  padding: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[2]};

  &:focus {
    border-color: ${themeCssVariables.color.blue};
    outline: none;
  }
`;

const StyledHint = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.xs};
`;

const StyledButtonRow = styled.div`
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  padding-top: ${themeCssVariables.spacing[2]};
`;

const StyledStatusRow = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  padding: ${themeCssVariables.spacing[2]} 0;
`;

const toDatetimeLocalValue = (isoString: string): string => {
  return isoString.replace('Z', '').slice(0, 16);
};

const fromDatetimeLocalToISO = (localValue: string): string => {
  return new Date(localValue + 'Z').toISOString();
};

export const SettingsAdminMaintenanceMode = () => {
  const { data, refetch } = useQuery<GetMaintenanceModeResult>(
    GET_MAINTENANCE_MODE,
    { fetchPolicy: 'network-only' },
  );

  const [setMaintenanceModeMutation, { loading: settingMaintenance }] =
    useMutation(SET_MAINTENANCE_MODE);
  const [clearMaintenanceModeMutation, { loading: clearingMaintenance }] =
    useMutation(CLEAR_MAINTENANCE_MODE);

  const currentMaintenance = data?.getMaintenanceMode ?? null;
  const isActive = isDefined(currentMaintenance);

  const [startAt, setStartAt] = useState('');
  const [endAt, setEndAt] = useState('');
  const [link, setLink] = useState('');

  const hasInitializedFromServer = useRef(false);

  if (isDefined(currentMaintenance) && !hasInitializedFromServer.current) {
    hasInitializedFromServer.current = true;
    setStartAt(toDatetimeLocalValue(currentMaintenance.startAt));
    setEndAt(toDatetimeLocalValue(currentMaintenance.endAt));
    setLink(currentMaintenance.link ?? '');
  }

  const handleActivate = useCallback(async () => {
    if (!isNonEmptyString(startAt) || !isNonEmptyString(endAt)) {
      return;
    }

    await setMaintenanceModeMutation({
      variables: {
        startAt: fromDatetimeLocalToISO(startAt),
        endAt: fromDatetimeLocalToISO(endAt),
        link: link || undefined,
      },
    });

    await refetch();
  }, [startAt, endAt, link, setMaintenanceModeMutation, refetch]);

  const handleDeactivate = useCallback(async () => {
    await clearMaintenanceModeMutation();
    setStartAt('');
    setEndAt('');
    setLink('');
    await refetch();
  }, [clearMaintenanceModeMutation, refetch]);

  return (
    <Section>
      <H2Title
        title={t`Maintenance Mode`}
        description={t`Schedule a maintenance window and notify all users`}
      />
      <Card>
        <CardContent>
          <StyledStatusRow>
            <Status
              color={isActive ? 'orange' : 'green'}
              text={isActive ? t`Maintenance Scheduled` : t`No Maintenance`}
            />
          </StyledStatusRow>
          <StyledFormRow>
            <StyledLabel>{t`Start (UTC)`}</StyledLabel>
            <StyledInput
              type="datetime-local"
              value={startAt}
              onChange={(event) => setStartAt(event.target.value)}
            />
            <StyledHint>UTC</StyledHint>
          </StyledFormRow>
          <StyledFormRow>
            <StyledLabel>{t`End (UTC)`}</StyledLabel>
            <StyledInput
              type="datetime-local"
              value={endAt}
              onChange={(event) => setEndAt(event.target.value)}
            />
            <StyledHint>UTC</StyledHint>
          </StyledFormRow>
          <StyledFormRow>
            <StyledLabel>{t`Link`}</StyledLabel>
            <StyledInput
              type="url"
              placeholder="https://status.example.com"
              value={link}
              onChange={(event) => setLink(event.target.value)}
              style={{ flex: 1 }}
            />
          </StyledFormRow>
          <StyledButtonRow>
            <Button
              title={isActive ? t`Update` : t`Activate`}
              variant="primary"
              size="small"
              onClick={handleActivate}
              disabled={
                !isNonEmptyString(startAt) ||
                !isNonEmptyString(endAt) ||
                settingMaintenance
              }
            />
            {isActive && (
              <Button
                title={t`Deactivate`}
                variant="secondary"
                size="small"
                onClick={handleDeactivate}
                disabled={clearingMaintenance}
              />
            )}
          </StyledButtonRow>
        </CardContent>
      </Card>
    </Section>
  );
};
