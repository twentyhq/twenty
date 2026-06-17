import { useApplicationChipData } from '@/applications/hooks/useApplicationChipData';
import { useIsThirdPartyApplication } from '@/applications/hooks/useIsThirdPartyApplication';
import { logicFunctionsSelector } from '@/logic-functions/states/logicFunctionsSelector';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { isDefined } from 'twenty-shared/utils';

type LogicFunctionThirdPartyApplicationInformation = {
  applicationId: string;
  name: string;
};

export const useLogicFunctionThirdPartyApplicationInformation = (
  logicFunctionId?: string,
): LogicFunctionThirdPartyApplicationInformation | undefined => {
  const logicFunctions = useAtomStateValue(logicFunctionsSelector);

  const applicationId = isDefined(logicFunctionId)
    ? logicFunctions.find(
        (logicFunction) => logicFunction.id === logicFunctionId,
      )?.applicationId
    : undefined;

  const isThirdPartyApplication = useIsThirdPartyApplication(applicationId);

  const { applicationChipData } = useApplicationChipData({ applicationId });

  if (!isThirdPartyApplication || !isDefined(applicationId)) {
    return undefined;
  }

  return {
    applicationId,
    name: applicationChipData.name,
  };
};
