import { useCallback } from 'react';

import { useEnrichHeadlessCommandContextApiWithWorkflowVersionTriggerInformation } from '@/command-menu-item/engine-command/hooks/useEnrichHeadlessCommandContextApiWithWorkflowVersionTriggerInformation';
import { headlessCommandContextApisState } from '@/command-menu-item/engine-command/states/headlessCommandContextApisState';
import { buildHeadlessCommandContextApi } from '@/command-menu-item/engine-command/utils/buildHeadlessCommandContextApi';
import { useStore } from 'jotai';
import { isDefined } from 'twenty-shared/utils';
import {
  type CommandMenuItemAvailabilityType,
  type EngineComponentKey,
} from '~/generated-metadata/graphql';

type MountCommandParams = {
  engineCommandId: string;
  contextStoreInstanceId: string;
  engineComponentKey: EngineComponentKey;
  frontComponentId?: string;
  workflowVersionId?: string;
  availabilityType?: CommandMenuItemAvailabilityType;
  availabilityObjectMetadataId?: string | null;
  payload?: Record<string, unknown> | null;
};

export const useMountCommand = () => {
  const store = useStore();

  const {
    enrichHeadlessCommandContextApiWithWorkflowVersionTriggerInformation,
  } = useEnrichHeadlessCommandContextApiWithWorkflowVersionTriggerInformation();

  const mountCommand = useCallback(
    async ({
      engineCommandId,
      contextStoreInstanceId,
      engineComponentKey,
      frontComponentId,
      workflowVersionId,
      availabilityType,
      availabilityObjectMetadataId,
      payload,
    }: MountCommandParams) => {
      const headlessEngineCommandContextApi = buildHeadlessCommandContextApi({
        store,
        contextStoreInstanceId,
        engineComponentKey,
        payload,
      });

      const commandState = isDefined(frontComponentId)
        ? { ...headlessEngineCommandContextApi, frontComponentId }
        : isDefined(workflowVersionId) && isDefined(availabilityType)
          ? await enrichHeadlessCommandContextApiWithWorkflowVersionTriggerInformation(
              {
                headlessEngineCommandContextApi,
                workflowVersionId,
                availabilityType,
                availabilityObjectMetadataId,
              },
            )
          : headlessEngineCommandContextApi;

      if (!isDefined(commandState)) {
        return;
      }

      store.set(headlessCommandContextApisState.atom, (previousMap) => {
        const newMap = new Map(previousMap);

        newMap.set(engineCommandId, commandState);

        return newMap;
      });
    },
    [
      store,
      enrichHeadlessCommandContextApiWithWorkflowVersionTriggerInformation,
    ],
  );

  return mountCommand;
};
