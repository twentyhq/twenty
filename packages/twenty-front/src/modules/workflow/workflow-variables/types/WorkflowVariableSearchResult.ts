import { type ThemeColor } from 'twenty-ui/theme';

export type WorkflowVariableSearchResult = {
  stepId: string;
  path: string[];
  label: string;
  breadcrumb: string;
  icon?: string;
  iconColor?: ThemeColor;
  isLeaf: boolean;
  isFullRecord?: boolean;
};
