import { type SelectOptionMeta } from 'src/types/select-option-meta';

export const COMPANY_TYPE_OPTIONS: readonly SelectOptionMeta[] = [
  {
    key: 'public',
    value: 'PUBLIC',
    label: 'Public',
    color: 'blue',
    position: 0,
  },
  {
    key: 'private',
    value: 'PRIVATE',
    label: 'Private',
    color: 'red',
    position: 1,
  },
  {
    key: 'publicSubsidiary',
    value: 'PUBLIC_SUBSIDIARY',
    label: 'Public Subsidiary',
    color: 'green',
    position: 2,
  },
  {
    key: 'educational',
    value: 'EDUCATIONAL',
    label: 'Educational',
    color: 'orange',
    position: 3,
  },
  {
    key: 'government',
    value: 'GOVERNMENT',
    label: 'Government',
    color: 'purple',
    position: 4,
  },
  {
    key: 'nonprofit',
    value: 'NONPROFIT',
    label: 'Nonprofit',
    color: 'yellow',
    position: 5,
  },
];
