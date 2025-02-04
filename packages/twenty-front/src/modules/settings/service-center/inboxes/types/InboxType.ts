import { IntegrationType } from '@/settings/service-center/types/IntegrationType';

export type Inbox = {
  id: string;
  integrationType: IntegrationType;
  whatsappIntegration?: {
    id: string;
    label: string;
    phoneId: string;
    disabled: boolean;
  };
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
