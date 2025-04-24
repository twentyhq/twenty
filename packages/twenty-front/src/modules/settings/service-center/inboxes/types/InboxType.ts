import { IntegrationType } from '@/settings/service-center/types/IntegrationType';

export type Inbox = {
  id: string;
  integrationType: IntegrationType;
  whatsappIntegrationId?: string;
  // messengerIntegration?: {
  //   id: string;
  //   label: string;
  //   fb_page: string;
  //   disabled: boolean;
  // };
  workspace: {
    id: string;
    displayName: string;
  };
};
