import { AppChip } from '@/applications/components/AppChip';
import { logicFunctionsSelector } from '@/logic-functions/states/logicFunctionsSelector';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { getActionIconStrokeOrThrow } from '@/workflow/workflow-steps/workflow-actions/utils/getActionIconStrokeOrThrow';
import { getActionIconColorOrThrow } from '@/workflow/workflow-steps/workflow-actions/utils/getActionIconColorOrThrow';
import { getActionIcon } from '@/workflow/workflow-steps/workflow-actions/utils/getActionIcon';
import { useContext } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { useIcons } from 'twenty-ui/icon';
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
  const stroke = getActionIconStrokeOrThrow('LOGIC_FUNCTION');

  return (
    <FallbackIcon
      size={theme.icon.size.md}
      color={getActionIconColorOrThrow('LOGIC_FUNCTION')}
      stroke={isDefined(stroke) ? theme.icon.stroke[stroke] : undefined}
    />
  );
};
