import { WorkflowAction } from '@/workflow/types/Workflow';
import { IconComponent, useIcons } from 'twenty-ui/display';
import { getActionIcon } from '../utils/getActionIcon';
import { useActionHeaderTypeOrThrow } from './useActionHeaderTypeOrThrow';
import { useActionIconColorOrThrow } from './useActionIconColorOrThrow';

type UseWorkflowActionHeaderProps = {
  action: WorkflowAction;
  defaultTitle: string;
};

type UseWorkflowActionHeaderReturn = {
  headerTitle: string;
  headerIcon: string | undefined;
  headerIconColor: string;
  headerType: string;
  getIcon: (iconName: string) => IconComponent;
};

export const useWorkflowActionHeader = ({
  action,
  defaultTitle,
}: UseWorkflowActionHeaderProps): UseWorkflowActionHeaderReturn => {
  const { getIcon } = useIcons();

  const headerTitle = action.name ? action.name : defaultTitle;
  const headerIcon = getActionIcon(action.type);
  const headerIconColor = useActionIconColorOrThrow(action.type);
  const headerType = useActionHeaderTypeOrThrow(action.type);

  return {
    headerTitle,
    headerIcon,
    headerIconColor,
    headerType,
    getIcon,
  };
};
