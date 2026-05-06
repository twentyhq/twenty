import { type ApplicationDisplayData } from '@/applications/types/applicationDisplayData.type';

export type ApplicationDataTableRow = {
  key: string;
  labelPlural: string;
  icon?: string;
  fieldsCount: number;
  link?: string;
  application: ApplicationDisplayData;
};
