import { LazyFrontComponentRenderer } from '@/front-components/components/LazyFrontComponentRenderer';
import { Suspense } from 'react';

import { useHeadlessCommandContextApi } from '@/command-menu-item/engine-command/hooks/useHeadlessCommandContextApi';
import { CommandComponentInstanceContext } from '@/command-menu-item/engine-command/states/contexts/CommandComponentInstanceContext';
import { isHeadlessFrontComponentCommandContextApi } from '@/command-menu-item/engine-command/utils/isHeadlessFrontComponentCommandContextApi';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { doNotTranslate } from 'twenty-shared/i18n';

export const HeadlessFrontComponentRendererEngineCommand = () => {
  const commandMenuItemId = useAvailableComponentInstanceIdOrThrow(
    CommandComponentInstanceContext,
  );

  const context = useHeadlessCommandContextApi();

  if (!isHeadlessFrontComponentCommandContextApi(context)) {
    throw new Error(
      doNotTranslate(
        'Context is not a headless front component command context API',
      ),
    );
  }

  const selectedRecordIds = context.selectedRecords.map((record) => record.id);

  return (
    <Suspense fallback={null}>
      <LazyFrontComponentRenderer
        frontComponentId={context.frontComponentId}
        commandMenuItemId={commandMenuItemId}
        selectedRecordIds={selectedRecordIds}
        selectedRecordsFilter={context.graphqlFilter}
        objectNameSingular={context.objectMetadataItem?.nameSingular}
      />
    </Suspense>
  );
};
