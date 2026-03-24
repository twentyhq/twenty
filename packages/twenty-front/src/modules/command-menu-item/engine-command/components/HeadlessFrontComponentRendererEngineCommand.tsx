import { Suspense, lazy } from 'react';

import { useMountedCommandState } from '@/command-menu-item/engine-command/hooks/useMountedCommandState';
import { CommandComponentInstanceContext } from '@/command-menu-item/engine-command/states/contexts/CommandComponentInstanceContext';
import { isMountedFrontComponentCommandState } from '@/command-menu-item/engine-command/utils/isMountedFrontComponentCommandState';
import { LayoutRenderingProvider } from '@/ui/layout/contexts/LayoutRenderingContext';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
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

  const context = useMountedCommandState();

  if (!isMountedFrontComponentCommandState(context)) {
    throw new Error('Context is not a mounted front component command state');
  }

  const objectNameSingular = context.objectMetadataItem?.nameSingular;

  const recordId =
    context.selectedRecords.length === 1
      ? context.selectedRecords[0].id
      : undefined;

  // TODO: Remove layout rendering provider once we have refactored FrontComponentRenderer to have one headless renderer and a standard renderer
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
