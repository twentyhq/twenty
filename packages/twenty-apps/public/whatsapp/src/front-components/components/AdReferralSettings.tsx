import { isNonEmptyString } from '@sniptt/guards';
import { useEffect, useState } from 'react';
import { RestApiClient } from 'twenty-client-sdk/rest';
import { enqueueSnackbar, useTranslate } from 'twenty-sdk/front-component';
import { isDefined } from 'twenty-sdk/utils';
import { Callout } from 'twenty-ui/components/feedback';
import { Section } from 'twenty-ui/components/layout';
import { Checkbox } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme';

import {
  AD_REFERRAL_SETTINGS_GET_ROUTE_PATH,
  AD_REFERRAL_SETTINGS_SET_ROUTE_PATH,
} from 'src/constants/ad-referral-settings.constant';
import { type GetAdReferralSettingsResult } from 'src/logic-functions/types/ad-referral-settings.type';
import { type TemplateRouteResult } from 'src/logic-functions/types/template-route-result.type';

const rowStyle = {
  alignItems: 'center',
  color: themeCssVariables.font.color.primary,
  cursor: 'pointer',
  display: 'flex',
  fontFamily: themeCssVariables.font.family,
  fontSize: themeCssVariables.font.size.sm,
  gap: themeCssVariables.spacing[2],
  padding: themeCssVariables.spacing[1],
} as const;

export const AdReferralSettings = () => {
  const { t } = useTranslate();
  const [settings, setSettings] = useState<GetAdReferralSettingsResult | undefined>(undefined);
  const [isSaving, setIsSaving] = useState(false);
  const [loadError, setLoadError] = useState<string | undefined>(undefined);

  // front components have no data hook, so the settings load once when the page opens
  useEffect(() => {
    new RestApiClient()
      .get<GetAdReferralSettingsResult>(`/s${AD_REFERRAL_SETTINGS_GET_ROUTE_PATH}`)
      .then(setSettings)
      .catch(() => setLoadError(t('Could not load the ad settings. Try again.')));
  }, []);

  const handleToggle = async (isOpportunityCreated: boolean) => {
    if (!isDefined(settings)) {
      return;
    }

    setIsSaving(true);
    setSettings({ ...settings, isOpportunityCreated });

    try {
      const result = await new RestApiClient().post<TemplateRouteResult>(`/s${AD_REFERRAL_SETTINGS_SET_ROUTE_PATH}`, {
        isOpportunityCreated,
      });

      if (!result.success) {
        setSettings(settings);
        await enqueueSnackbar({ message: result.error, variant: 'error' });
      }
    } catch {
      setSettings(settings);
      await enqueueSnackbar({ message: t('Could not save the ad settings. Try again.'), variant: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Section.Root>
      <Section.Header
        title={t('Click-to-WhatsApp ads')}
        description={t('What happens when someone starts a conversation from one of your ads.')}
      />
      {isNonEmptyString(loadError) ? (
        <Callout status="error" title={loadError} />
      ) : !isDefined(settings) ? (
        <span style={rowStyle}>{t('Loading…')}</span>
      ) : (
        <label style={rowStyle}>
          <Checkbox
            checked={settings.isOpportunityCreated}
            disabled={!settings.canEdit || isSaving}
            onCheckedChange={(checked) => handleToggle(checked === true)}
          />
          <span>{t('Create an opportunity for the person, linked to the ad')}</span>
        </label>
      )}
    </Section.Root>
  );
};
