import { type SelectOptionMeta } from 'src/types/select-option-meta';

export const JOB_TITLE_CLASS_OPTIONS: readonly SelectOptionMeta[] = [
  {
    key: 'generalAndAdministrative',
    value: 'GENERAL_AND_ADMINISTRATIVE',
    label: 'General and Administrative',
    color: 'blue',
    position: 0,
  },
  {
    key: 'researchAndDevelopment',
    value: 'RESEARCH_AND_DEVELOPMENT',
    label: 'Research and Development',
    color: 'red',
    position: 1,
  },
  {
    key: 'salesAndMarketing',
    value: 'SALES_AND_MARKETING',
    label: 'Sales and Marketing',
    color: 'green',
    position: 2,
  },
  {
    key: 'services',
    value: 'SERVICES',
    label: 'Services',
    color: 'orange',
    position: 3,
  },
  {
    key: 'unemployed',
    value: 'UNEMPLOYED',
    label: 'Unemployed',
    color: 'purple',
    position: 4,
  },
];
