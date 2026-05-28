import { AppChip } from '@/applications/components/AppChip';
import { useApplicationChipData } from '@/applications/hooks/useApplicationChipData';
import { type LogicFunction } from '@/logic-functions/types/LogicFunction';
import { MenuItem } from 'twenty-ui/navigation';

type ToolMenuItemProps = {
  logicFunction: LogicFunction;
  onClick: () => void;
};

export const ToolMenuItem = ({ logicFunction, onClick }: ToolMenuItemProps) => {
  const { applicationChipData } = useApplicationChipData({
    applicationId: logicFunction.applicationId,
  });

  return (
    <MenuItem
      withIconContainer={true}
      LeftIcon={() => (
        <AppChip
          applicationId={logicFunction.applicationId}
          size={'md'}
          chipOnly
        />
      )}
      text={
        logicFunction.workflowActionTriggerSettings?.label ?? logicFunction.name
      }
      contextualText={applicationChipData.name}
      onClick={onClick}
    />
  );
};
