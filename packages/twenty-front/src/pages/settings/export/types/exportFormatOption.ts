import { ExportFormat } from '~/pages/settings/export/types/exportFormat';

export interface ExportFormatOption {
  value: ExportFormat;
  label: string;
  description: string;
  icon: string;
}
