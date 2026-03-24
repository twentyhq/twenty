import { Suspense, lazy } from 'react';

import { CommandComponentInstanceContext } from '@/command-menu-item/engine-command/states/contexts/CommandComponentInstanceContext';
import { mountedCommandsState } from '@/command-menu-item/engine-command/states/mountedEngineCommandsState';
import { LayoutRenderingProvider } from '@/ui/layout/contexts/LayoutRenderingContext';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { isDefined } from 'twenty-shared/utils';
import { PageLayoutType } from '~/generated-metadata/graphql';

const FrontComponentRenderer = lazy(() =>
  import('@/front-components/components/FrontComponentRenderer').then(
    (module) => ({ default: module.FrontComponentRenderer }),
  ),
);

export const HeadlessFrontComponentRendererEngineCommand = () => {
  const commandMenuItemId = useAvailableComponentInstanceIdOrThrow(
    CommandComponentInstanceContext,
  );

  const mountedCommands = useAtomStateValue(mountedCommandsState);
  const context = mountedCommands.get(commandMenuItemId);

  if (!isDefined(context?.frontComponentId)) {
    return null;
  }

  const objectNameSingular = context.objectMetadataItem?.nameSingular;

  const recordId =
    context.selectedRecords.length === 1
      ? context.selectedRecords[0].id
      : undefined;

  return (
    <Suspense fallback={null}>
      <LayoutRenderingProvider
        value={{
          targetRecordIdentifier:
            isDefined(objectNameSingular) && isDefined(recordId)
              ? {
                  id: recordId,
                  targetObjectNameSingular: objectNameSingular,
                }
              : undefined,
          layoutType: PageLayoutType.DASHBOARD,
          isInSidePanel: false,
        }}
      >
        <FrontComponentRenderer
          frontComponentId={context.frontComponentId}
          commandMenuItemId={commandMenuItemId}
        />
      </LayoutRenderingProvider>
    </Suspense>
  );
};
