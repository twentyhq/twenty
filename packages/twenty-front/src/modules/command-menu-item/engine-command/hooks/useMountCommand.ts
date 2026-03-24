import { useCallback } from 'react';

import { useBuildTriggerWorkflowVersionCommandState } from '@/command-menu-item/engine-command/hooks/useBuildTriggerWorkflowVersionCommandState';
import { mountedCommandsState } from '@/command-menu-item/engine-command/states/mountedEngineCommandsState';
import { buildMountedCommandBaseState } from '@/command-menu-item/engine-command/utils/buildMountedCommandBaseState';
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
};

export const useMountCommand = () => {
  const store = useStore();

  const { buildTriggerWorkflowVersionCommandState } =
    useBuildTriggerWorkflowVersionCommandState();

  const mountCommand = useCallback(
    async ({
      engineCommandId,
      contextStoreInstanceId,
      engineComponentKey,
      frontComponentId,
      workflowVersionId,
      availabilityType,
      availabilityObjectMetadataId,
    }: MountCommandParams) => {
      const baseState = buildMountedCommandBaseState({
        store,
        contextStoreInstanceId,
        engineComponentKey,
      });

      const commandState = isDefined(frontComponentId)
        ? { ...baseState, frontComponentId }
        : isDefined(workflowVersionId) && isDefined(availabilityType)
          ? await buildTriggerWorkflowVersionCommandState({
              baseState,
              workflowVersionId,
              availabilityType,
              availabilityObjectMetadataId,
            })
          : baseState;

      if (!isDefined(commandState)) {
        return;
      }

      store.set(mountedCommandsState.atom, (previousMap) => {
        const newMap = new Map(previousMap);

        newMap.set(engineCommandId, commandState);

        return newMap;
      });
    },
    [store, buildTriggerWorkflowVersionCommandState],
  );

  return mountCommand;
};
