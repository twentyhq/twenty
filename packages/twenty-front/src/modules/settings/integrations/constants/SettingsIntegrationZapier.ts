import { SettingsIntegrationCategory } from '@/settings/integrations/types/SettingsIntegrationCategory';
import i18n from '~/utils/i18n/index';

export const SETTINGS_INTEGRATION_ZAPIER_CATEGORY: SettingsIntegrationCategory =
  {
    key: 'zapier',
    title: i18n.t('withZapier'),
    hyperlinkText: i18n.t('seeAllZaps'),
    hyperlink: 'https://zapier.com/apps/twenty/integrations',
    integrations: [
      {
        from: { key: 'twenty', image: '/images/integrations/twenty-logo.svg' },
        to: { key: 'slack', image: '/images/integrations/slack-logo.png' },
        type: 'Use',
        text: i18n.t('slackText'),
        link: 'https://zapier.com/apps/twenty/integrations/slack',
      },
      {
        from: { key: 'cal', image: '/images/integrations/cal-logo.png' },
        to: { key: 'twenty', image: '/images/integrations/twenty-logo.svg' },
        type: 'Use',
        text: i18n.t('calText'),
        link: 'https://zapier.com/apps/twenty/integrations/calcom',
      },
      {
        from: {
          key: 'mailchimp',
          image: '/images/integrations/mailchimp-logo.png',
        },
        to: { key: 'twenty', image: '/images/integrations/twenty-logo.svg' },
        type: 'Use',
        text: i18n.t('mailChimpText'),
        link: 'https://zapier.com/apps/twenty/integrations/mailchimp',
      },
      {
        from: { key: 'tally', image: '/images/integrations/tally-logo.png' },
        to: { key: 'twenty', image: '/images/integrations/twenty-logo.svg' },
        type: 'Use',
        text: i18n.t('tallyText'),
        link: 'https://zapier.com/apps/twenty/integrations/tally',
      },
    ],
  };
