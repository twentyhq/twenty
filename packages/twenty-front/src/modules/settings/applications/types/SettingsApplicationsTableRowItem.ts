import { type ApplicationDisplayData } from '@/applications/types/ApplicationDisplayData';
import { type ApplicationRegistrationSourceType } from '~/generated-metadata/graphql';

export type SettingsApplicationsTableRowItem = ApplicationDisplayData & {
  id: string;
  description: string | null;
  sourceType?: ApplicationRegistrationSourceType;
};
