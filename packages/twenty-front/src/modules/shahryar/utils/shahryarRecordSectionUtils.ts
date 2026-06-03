import { SHAHRYAR_APP_PATHS } from '@/shahryar/constants/shahryar-routes';
import {
  type ShahryarPhotoUploadTargetType,
  type ShahryarRecordApiSection,
} from '@/shahryar/types/shahryarRecordApi';
import {
  type IconComponent,
  IconCalendarX,
  IconClock,
  IconCurrencyDollar,
  IconMap,
  IconShield,
  IconUserPin,
} from 'twenty-ui/display';

export type ShahryarRecordFieldType = 'file' | 'number' | 'text' | 'textarea';

export type ShahryarRecordFormField = {
  name: string;
  label: string;
  type: ShahryarRecordFieldType;
  defaultValue: string;
};

export type ShahryarRecordFormValues = Record<string, string>;

export type ShahryarRecordSection = {
  path: string;
  title: string;
  Icon: IconComponent;
  canCreate: boolean;
  columns: string[];
  rows: string[][];
  formFields: ShahryarRecordFormField[];
};

export type ShahryarRecordPhotoFieldConfig = {
  fieldName: string;
  targetType: ShahryarPhotoUploadTargetType;
};

export type ShahryarRecordPhotoCounts = Record<string, number>;

export const SHAHRYAR_RECORD_PHOTO_FIELD_CONFIG_BY_PATH: Partial<
  Record<string, ShahryarRecordPhotoFieldConfig>
> = {
  [SHAHRYAR_APP_PATHS.Markets]: {
    fieldName: 'shopPhoto',
    targetType: 'market',
  },
  [SHAHRYAR_APP_PATHS.SupervisorVisits]: {
    fieldName: 'visitPhoto',
    targetType: 'visit',
  },
};

const marketFormFields: ShahryarRecordFormField[] = [
  {
    name: 'name',
    label: 'ناوی مارکێت',
    type: 'text',
    defaultValue: '',
  },
  {
    name: 'ownerName',
    label: 'ناوی خاوەن',
    type: 'text',
    defaultValue: '',
  },
  {
    name: 'phoneNumber',
    label: 'ژمارەی تەلەفۆن',
    type: 'text',
    defaultValue: '',
  },
  {
    name: 'marketAddress',
    label: 'ناونیشان',
    type: 'text',
    defaultValue: '',
  },
  {
    name: 'gpsLocation',
    label: 'GPS',
    type: 'text',
    defaultValue: '36.191, 44.009',
  },
  {
    name: 'shopPhoto',
    label: 'وێنەی دوکان',
    type: 'file',
    defaultValue: '',
  },
  {
    name: 'paymentStatus',
    label: 'قەرز / پارەدان',
    type: 'text',
    defaultValue: 'قەرز ماوە',
  },
  {
    name: 'notes',
    label: 'تێبینی',
    type: 'textarea',
    defaultValue: '',
  },
];

const supervisorVisitFormFields: ShahryarRecordFormField[] = [
  {
    name: 'supervisor',
    label: 'موشریف',
    type: 'text',
    defaultValue: 'کاروان',
  },
  {
    name: 'market',
    label: 'مارکێت',
    type: 'text',
    defaultValue: 'مارکێتی ئارام',
  },
  {
    name: 'checkInAt',
    label: 'Check-in',
    type: 'text',
    defaultValue: '09:00',
  },
  {
    name: 'gpsLocation',
    label: 'GPS',
    type: 'text',
    defaultValue: '36.191, 44.009',
  },
  {
    name: 'visitPhoto',
    label: 'وێنە',
    type: 'file',
    defaultValue: '',
  },
  {
    name: 'soldCartons',
    label: 'چەند کارتۆن فرۆشرا',
    type: 'number',
    defaultValue: '0',
  },
  {
    name: 'issue',
    label: 'کێشە چییە؟',
    type: 'textarea',
    defaultValue: '',
  },
  {
    name: 'decisionMaker',
    label: 'کێ بڕیاری دا',
    type: 'text',
    defaultValue: 'ئەدمین',
  },
  {
    name: 'requestDetails',
    label: 'داواکاری',
    type: 'textarea',
    defaultValue: '',
  },
  {
    name: 'report',
    label: 'ڕاپۆرت',
    type: 'textarea',
    defaultValue: '',
  },
];

export const SHAHRYAR_RECORD_SECTIONS: ShahryarRecordSection[] = [
  {
    path: SHAHRYAR_APP_PATHS.Markets,
    title: 'مارکێت و وەکیلەکان',
    Icon: IconMap,
    canCreate: true,
    columns: [
      'ناوی مارکێت',
      'ناوی خاوەن',
      'ژمارەی تەلەفۆن',
      'ناونیشان',
      'GPS',
      'وێنەی دوکان',
      'قەرز / پارەدان',
      'تێبینی',
    ],
    rows: [
      [
        'مارکێتی ئارام',
        'ئارام عەلی',
        '0750 000 0001',
        'هەولێر، شەقامی 100 مەتری',
        '36.191, 44.009',
        '-',
        'پارەدان کرا',
        'بەدواداچوونی هەفتانە',
      ],
      [
        'وەکیلی زاگرۆس',
        'سۆران قادر',
        '0750 000 0002',
        'هەولێر، بازاڕی زاگرۆس',
        '36.205, 44.023',
        '-',
        'قەرز ماوە',
        'قەرز پێویستی بە چارەسەر هەیە',
      ],
      [
        'مارکێتی شار',
        'هیوا قادر',
        '0750 000 0003',
        'هەولێر، بازاڕی شار',
        '36.214, 44.015',
        '-',
        'پارەدان کرا',
        'کۆگا کەم بووە',
      ],
    ],
    formFields: marketFormFields,
  },
  {
    path: SHAHRYAR_APP_PATHS.SupervisorVisits,
    title: 'سەردانی موشریف',
    Icon: IconUserPin,
    canCreate: true,
    columns: [
      'موشریف',
      'مارکێت',
      'Check-in',
      'GPS',
      'وێنە',
      'چەند کارتۆن فرۆشرا',
      'کێشە چییە؟',
      'کێ بڕیاری دا',
      'داواکاری',
      'ڕاپۆرت',
    ],
    rows: [
      [
        'کاروان',
        'مارکێتی ئارام',
        '09:12',
        '36.191, 44.009',
        '-',
        '18',
        'هیچ کێشەیەکی گرنگ نییە',
        'ئەدمین',
        '4 کارتۆنی تر',
        'سەردان تەواو بوو',
      ],
      [
        'هەڵۆ',
        'وەکیلی زاگرۆس',
        '10:34',
        '36.205, 44.023',
        '-',
        '11',
        'قەرز ماوە',
        'ئەدمین',
        '8 کارتۆنی نوێ',
        'پێویستی بە بەدواداچوونی پارەدان هەیە',
      ],
    ],
    formFields: supervisorVisitFormFields,
  },
  {
    path: SHAHRYAR_APP_PATHS.WorkingTimes,
    title: 'کاتی کارکردن',
    Icon: IconClock,
    canCreate: true,
    columns: [
      'موشریف',
      'ڕێکەوت',
      'دەستپێکردن',
      'کۆتایی',
      'GPS',
      'خولەک',
      'دۆخ',
    ],
    rows: [
      [
        'کاروان',
        '2026-06-01',
        '08:30',
        '16:30',
        '36.191, 44.009',
        '480',
        'ئامادە',
      ],
      [
        'هەڵۆ',
        '2026-06-01',
        '10:20',
        '15:50',
        '36.205, 44.023',
        '330',
        'درەنگ',
      ],
    ],
    formFields: [
      { name: 'supervisor', label: 'موشریف', type: 'text', defaultValue: '' },
      {
        name: 'workDate',
        label: 'ڕێکەوت',
        type: 'text',
        defaultValue: '2026-06-01',
      },
      {
        name: 'checkInAt',
        label: 'دەستپێکردن',
        type: 'text',
        defaultValue: '08:30',
      },
      {
        name: 'checkOutAt',
        label: 'کۆتایی',
        type: 'text',
        defaultValue: '',
      },
      {
        name: 'gpsLocation',
        label: 'GPS',
        type: 'text',
        defaultValue: '36.191, 44.009',
      },
      {
        name: 'totalMinutes',
        label: 'خولەک',
        type: 'number',
        defaultValue: '0',
      },
      { name: 'status', label: 'دۆخ', type: 'text', defaultValue: 'ئامادە' },
    ],
  },
  {
    path: SHAHRYAR_APP_PATHS.Payments,
    title: 'بەشی پارەدان',
    Icon: IconCurrencyDollar,
    canCreate: true,
    columns: ['مارکێت', 'بڕ', 'دۆخ', 'ڕێکەوت', 'تێبینی'],
    rows: [
      ['مارکێتی ئارام', '1,250,000', 'داخراو', '2026-06-01', 'پارەدان کرا'],
      ['وەکیلی زاگرۆس', '780,000', 'کراوە', '2026-06-01', 'قەرز ماوە'],
      ['مارکێتی شار', '2,100,000', 'داخراو', '2026-05-31', 'پارەدان کرا'],
    ],
    formFields: [
      { name: 'market', label: 'مارکێت', type: 'text', defaultValue: '' },
      { name: 'amount', label: 'بڕ', type: 'number', defaultValue: '0' },
      { name: 'status', label: 'دۆخ', type: 'text', defaultValue: 'کراوە' },
      {
        name: 'paymentDate',
        label: 'ڕێکەوت',
        type: 'text',
        defaultValue: '2026-06-01',
      },
      { name: 'notes', label: 'تێبینی', type: 'textarea', defaultValue: '' },
    ],
  },
  {
    path: SHAHRYAR_APP_PATHS.SupervisorPenalties,
    title: 'غرامەی موشریفەکان',
    Icon: IconShield,
    canCreate: true,
    columns: ['موشریف', 'هۆکار', 'بڕ', 'ڕێکەوت', 'بڕیاری دا'],
    rows: [
      ['کاروان', 'ڕاپۆرت نەهات', '25,000', '2026-06-01', 'ئەدمین'],
      ['هەڵۆ', 'سەردان نەکرا', '40,000', '2026-05-30', 'ئەدمین'],
    ],
    formFields: [
      { name: 'supervisor', label: 'موشریف', type: 'text', defaultValue: '' },
      { name: 'reason', label: 'هۆکار', type: 'text', defaultValue: '' },
      { name: 'amount', label: 'بڕ', type: 'number', defaultValue: '0' },
      {
        name: 'penaltyDate',
        label: 'ڕێکەوت',
        type: 'text',
        defaultValue: '2026-06-01',
      },
      {
        name: 'decidedBy',
        label: 'بڕیاری دا',
        type: 'text',
        defaultValue: 'ئەدمین',
      },
    ],
  },
  {
    path: SHAHRYAR_APP_PATHS.Absences,
    title: 'غیابات',
    Icon: IconCalendarX,
    canCreate: true,
    columns: ['موشریف', 'ڕێکەوت', 'کاتی کارکردن', 'GPS', 'تێبینی'],
    rows: [
      ['بەهروز', '2026-06-01', 'نەدەستی پێکرد', '-', 'غیاب'],
      ['هەڵۆ', '2026-05-29', '10:20 - 15:50', '36.205, 44.023', 'درەنگ هات'],
    ],
    formFields: [
      { name: 'supervisor', label: 'موشریف', type: 'text', defaultValue: '' },
      {
        name: 'absenceDate',
        label: 'ڕێکەوت',
        type: 'text',
        defaultValue: '2026-06-01',
      },
      {
        name: 'workingTime',
        label: 'کاتی کارکردن',
        type: 'text',
        defaultValue: 'نەدەستی پێکرد',
      },
      {
        name: 'gpsLocation',
        label: 'GPS',
        type: 'text',
        defaultValue: '-',
      },
      { name: 'notes', label: 'تێبینی', type: 'textarea', defaultValue: '' },
    ],
  },
];

export const getDefaultShahryarRecordFormValues = (
  section: ShahryarRecordSection,
): ShahryarRecordFormValues =>
  Object.fromEntries(
    section.formFields.map((field) => [field.name, field.defaultValue]),
  );

export const toShahryarPhotoCountLabel = (photoCount: number): string =>
  photoCount === 0 ? '-' : `${photoCount} وێنە`;

export const buildShahryarRecordRow = ({
  photoCounts,
  section,
  values,
}: {
  photoCounts?: ShahryarRecordPhotoCounts;
  section: ShahryarRecordSection;
  values: ShahryarRecordFormValues;
}): string[] =>
  section.formFields.map((field) => {
    if (field.type === 'file') {
      const photoCount = photoCounts?.[field.name];

      if (photoCount !== undefined) {
        return toShahryarPhotoCountLabel(photoCount);
      }
    }

    const value = values[field.name]?.trim();

    return value === undefined || value.length === 0 ? '-' : value;
  });

export const buildInitialShahryarRowsByPath = (): Record<string, string[][]> =>
  buildShahryarRowsByPath();

export const buildInitialShahryarCanCreateByPath = (): Record<
  string,
  boolean
> => buildShahryarCanCreateByPath();

export const buildShahryarCanCreateByPath = (
  recordSections: ShahryarRecordApiSection[] = [],
): Record<string, boolean> => {
  const canCreateByPathFromApi = new Map(
    recordSections
      .filter((recordSection) => recordSection.canCreate !== undefined)
      .map((recordSection) => [
        recordSection.path,
        recordSection.canCreate === true,
      ]),
  );

  return Object.fromEntries(
    SHAHRYAR_RECORD_SECTIONS.map((section) => [
      section.path,
      canCreateByPathFromApi.get(section.path) ?? section.canCreate,
    ]),
  );
};

export const buildShahryarRowsByPath = (
  recordSections: ShahryarRecordApiSection[] = [],
): Record<string, string[][]> => {
  const rowsByPathFromApi = new Map(
    recordSections.map((recordSection) => [
      recordSection.path,
      recordSection.rows,
    ]),
  );

  return Object.fromEntries(
    SHAHRYAR_RECORD_SECTIONS.map((section) => [
      section.path,
      rowsByPathFromApi.get(section.path) ?? section.rows,
    ]),
  );
};
