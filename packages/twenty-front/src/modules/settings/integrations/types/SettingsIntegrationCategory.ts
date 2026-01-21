import { type SettingsIntegration } from '@/settings/integrations/types/SettingsIntegration';

export type SettingsIntegrationCategory = {
  key: string;
  title: string;
  hyperlinkText?: string;
  hyperlink?: string | null;
  integrations: SettingsIntegration[];
};
