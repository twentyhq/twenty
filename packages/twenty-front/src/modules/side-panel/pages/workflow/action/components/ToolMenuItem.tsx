import { AppMenuItem } from '@/applications/components/AppMenuItem';
import { type LogicFunction } from '@/logic-functions/types/LogicFunction';

type ToolMenuItemProps = {
  logicFunction: LogicFunction;
  onClick: () => void;
};

export const ToolMenuItem = ({ logicFunction, onClick }: ToolMenuItemProps) => {
  return (
    <AppMenuItem
      applicationId={logicFunction.applicationId}
      text={
        logicFunction.workflowActionTriggerSettings?.label ?? logicFunction.name
      }
      onClick={onClick}
    />
  );
};
