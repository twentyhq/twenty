import { AppChip } from '@/applications/components/AppChip';
import { logicFunctionsSelector } from '@/logic-functions/states/logicFunctionsSelector';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { getActionIcon } from '@/workflow/workflow-steps/workflow-actions/utils/getActionIcon';
import { useContext } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { useIcons } from 'twenty-ui/display';
import { ThemeContext } from 'twenty-ui/theme-constants';

export const WorkflowDiagramStepNodeLogicFunctionIcon = ({
  logicFunctionId,
}: {
  logicFunctionId?: string;
}) => {
  const { theme } = useContext(ThemeContext);
  const { getIcon } = useIcons();
  const logicFunctions = useAtomStateValue(logicFunctionsSelector);

  const applicationId = isDefined(logicFunctionId)
    ? logicFunctions.find(
        (logicFunction) => logicFunction.id === logicFunctionId,
      )?.applicationId
    : undefined;

  if (isDefined(applicationId)) {
    return <AppChip applicationId={applicationId} size="md" chipOnly />;
  }

  const FallbackIcon = getIcon(getActionIcon('LOGIC_FUNCTION'));

  return (
    <FallbackIcon
      size={theme.icon.size.md}
      color={theme.font.color.tertiary}
      stroke={theme.icon.stroke.sm}
    />
  );
};
