import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { t } from '@lingui/core/macro';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';

import { usePersistLogicFunction } from '@/logic-functions/hooks/usePersistLogicFunction';
import { useToast } from 'twenty-ui/feedback';

export const useCreateTool = () => {
  const navigate = useNavigate();
  const { add: addToast } = useToast();
  const { createLogicFunction } = usePersistLogicFunction();
  const [isCreatingTool, setIsCreatingTool] = useState(false);

  const handleCreateTool = async () => {
    setIsCreatingTool(true);
    try {
      const result = await createLogicFunction({
        input: {
          name: 'new-tool',
          toolTriggerSettings: {
            inputSchema: { type: 'object', properties: {} },
          },
        },
      });

      // Failure path already surfaces its own toast from usePersistLogicFunction.
      if (result.status !== 'successful' || !isDefined(result.response?.data)) {
        return;
      }

      const newLogicFunction = result.response.data.createOneLogicFunction;
      addToast({ variant: 'success', children: t`Tool created` });

      const applicationId = newLogicFunction.applicationId;
      if (isDefined(applicationId)) {
        navigate(
          getSettingsPath(SettingsPath.ApplicationLogicFunctionDetail, {
            applicationId,
            logicFunctionId: newLogicFunction.id,
          }),
        );
      } else {
        navigate(
          getSettingsPath(SettingsPath.LogicFunctionDetail, {
            logicFunctionId: newLogicFunction.id,
          }),
        );
      }
    } finally {
      setIsCreatingTool(false);
    }
  };

  return { handleCreateTool, isCreatingTool };
};
