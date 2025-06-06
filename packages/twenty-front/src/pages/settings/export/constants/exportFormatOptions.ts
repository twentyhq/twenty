import { ExportFormatOption } from '~/pages/settings/export/types/exportFormatOption';

export const EXPORT_FORMAT_OPTIONS: ExportFormatOption[] = [
  {
    value: 'json',
    label: 'JSON',
    description: 'JavaScript Object Notation - ideal for developers and APIs',
    icon: 'IconFileText',
  },
  {
    value: 'csv',
    label: 'CSV',
    description:
      'Comma Separated Values - compatible with Excel and spreadsheets',
    icon: 'IconTable',
  },
];
