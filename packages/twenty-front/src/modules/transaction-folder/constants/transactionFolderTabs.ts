import {
    IconCheckbox,
    IconCurrencyDollar,
    IconFolder,
    IconHome,
    IconShield,
    IconTimeline,
} from 'twenty-ui/display';

export const TRANSACTION_FOLDER_TABS = [
  {
    id: 'overview',
    title: 'Overview',
    Icon: IconHome,
    description: 'Transaction summary and key information',
  },
  {
    id: 'files',
    title: 'Files',
    Icon: IconFolder,
    description: 'Documents, contracts, and uploads',
  },
  {
    id: 'timeline',
    title: 'Timeline',
    Icon: IconTimeline,
    description: 'Key dates and milestones',
  },
  {
    id: 'checklist',
    title: 'Checklist',
    Icon: IconCheckbox,
    description: 'Transaction checklist and tasks',
  },
  {
    id: 'compliance',
    title: 'Compliance',
    Icon: IconShield,
    description: 'Compliance tracking and requirements',
  },
  {
    id: 'finance',
    title: 'Finance',
    Icon: IconCurrencyDollar,
    description: 'Financial details and commission',
  },
] as const;

export type TransactionFolderTabId =
  (typeof TRANSACTION_FOLDER_TABS)[number]['id'];
