import type { getObjectTypeLabel } from '@/settings/data-model/utils/getObjectTypeLabel';

export interface ExportObjectItem {
  id: string;
  name: string;
  labelPlural: string;
  objectTypeLabel: ReturnType<typeof getObjectTypeLabel>;
  objectTypeLabelText: string;
  fieldsCount: number;
  totalObjectCount: number;
  icon: string;
}
