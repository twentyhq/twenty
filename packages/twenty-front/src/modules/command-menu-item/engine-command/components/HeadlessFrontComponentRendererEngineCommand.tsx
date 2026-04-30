import { Suspense, lazy } from 'react';

import { useHeadlessCommandContextApi } from '@/command-menu-item/engine-command/hooks/useHeadlessCommandContextApi';
import { CommandComponentInstanceContext } from '@/command-menu-item/engine-command/states/contexts/CommandComponentInstanceContext';
import { isHeadlessFrontComponentCommandContextApi } from '@/command-menu-item/engine-command/utils/isHeadlessFrontComponentCommandContextApi';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';

const FrontComponentRenderer = lazy(() =>
  import('@/front-components/components/FrontComponentRenderer').then(
    (module) => ({ default: module.FrontComponentRenderer }),
  ),
);

export const HeadlessFrontComponentRendererEngineCommand = () => {
  const commandMenuItemId = useAvailableComponentInstanceIdOrThrow(
    CommandComponentInstanceContext,
  );

  const context = useHeadlessCommandContextApi();

  if (!isHeadlessFrontComponentCommandContextApi(context)) {
    throw new Error(
      'Context is not a headless front component command context API',
    );
  }

  const recordId =
    context.selectedRecords.length === 1
      ? context.selectedRecords[0].id
      : undefined;

  return (
    <Suspense fallback={null}>
      <FrontComponentRenderer
        frontComponentId={context.frontComponentId}
        commandMenuItemId={commandMenuItemId}
        recordId={recordId}
      />
    </Suspense>
  );
};
