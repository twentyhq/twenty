import { SettingsIntegrationCategory } from '@/settings/integrations/types/SettingsIntegrationCategory';

export const SETTINGS_INTEGRATION_ZAPIER_CATEGORY: SettingsIntegrationCategory =
  {
    key: 'zapier',
    title: 'Com Zapier',
    // hyperlinkText: 'Ver todos os zaps',
    hyperlinkText: 'Receber Convite de Acesso',
    // hyperlink: 'https://zapier.com/apps/digitoservice/integrations',
    hyperlink:
      'https://zapier.com/developer/public-invite/210096/63c375ce94f41fe05ae65156ee9a55ba',
    integrations: [
      {
        from: { key: 'twenty', image: '/images/integrations/twenty-logo.svg' },
        to: { key: 'slack', image: '/images/integrations/slack-logo.png' },
        type: 'Use',
        text: 'Postar no Slack quando uma empresa for atualizada',
        // link: 'https://zapier.com/apps/digitoservice/integrations/slack',
        link: 'https://zapier.com/developer/public-invite/210096/63c375ce94f41fe05ae65156ee9a55ba',
      },
      {
        from: { key: 'cal', image: '/images/integrations/cal-logo.png' },
        to: { key: 'twenty', image: '/images/integrations/twenty-logo.svg' },
        type: 'Use',
        text: 'Criar uma pessoa quando um evento do Cal.com for criado',
        // link: 'https://zapier.com/apps/digitoservice/integrations/calcom',
        link: 'https://zapier.com/developer/public-invite/210096/63c375ce94f41fe05ae65156ee9a55ba',
      },
      {
        from: {
          key: 'mailchimp',
          image: '/images/integrations/mailchimp-logo.png',
        },
        to: { key: 'twenty', image: '/images/integrations/twenty-logo.svg' },
        type: 'Use',
        text: 'Criar uma pessoa quando um subscritor do MailChimp for criado',
        // link: 'https://zapier.com/apps/digitoservice/integrations/mailchimp',
        link: 'https://zapier.com/developer/public-invite/210096/63c375ce94f41fe05ae65156ee9a55ba',
      },
      {
        from: { key: 'tally', image: '/images/integrations/tally-logo.png' },
        to: { key: 'twenty', image: '/images/integrations/twenty-logo.svg' },
        type: 'Use',
        text: 'Criar uma empresa quando um formulário do Tally for enviado',
        // link: 'https://zapier.com/apps/digitoservice/integrations/tally',
        link: 'https://zapier.com/developer/public-invite/210096/63c375ce94f41fe05ae65156ee9a55ba',
      },
    ],
  };
