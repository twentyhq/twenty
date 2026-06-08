import { type SelectOptionMeta } from 'src/types/select-option-meta';

export const SENIORITY_OPTIONS: readonly SelectOptionMeta[] = [
  {
    key: 'cxo',
    value: 'CXO',
    label: 'CXO',
    color: 'blue',
    position: 0,
  },
  {
    key: 'owner',
    value: 'OWNER',
    label: 'Owner',
    color: 'red',
    position: 1,
  },
  {
    key: 'vp',
    value: 'VP',
    label: 'VP',
    color: 'green',
    position: 2,
  },
  {
    key: 'director',
    value: 'DIRECTOR',
    label: 'Director',
    color: 'orange',
    position: 3,
  },
  {
    key: 'partner',
    value: 'PARTNER',
    label: 'Partner',
    color: 'purple',
    position: 4,
  },
  {
    key: 'senior',
    value: 'SENIOR',
    label: 'Senior',
    color: 'yellow',
    position: 5,
  },
  {
    key: 'manager',
    value: 'MANAGER',
    label: 'Manager',
    color: 'pink',
    position: 6,
  },
  {
    key: 'entry',
    value: 'ENTRY',
    label: 'Entry',
    color: 'cyan',
    position: 7,
  },
  {
    key: 'training',
    value: 'TRAINING',
    label: 'Training',
    color: 'brown',
    position: 8,
  },
  {
    key: 'unpaid',
    value: 'UNPAID',
    label: 'Unpaid',
    color: 'lime',
    position: 9,
  },
];
