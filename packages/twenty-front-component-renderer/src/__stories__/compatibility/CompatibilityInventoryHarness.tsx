import { type FrontComponentExecutionContext } from 'twenty-sdk/front-component';
import { isDefined } from 'twenty-shared/utils';
import { useState } from 'react';

import { hostApiMocks } from '@/__stories__/shared/test-utils/createFrontComponentStoryMeta';
import { getBuiltStoryComponentPathForRender } from '@/__stories__/utils/getBuiltStoryComponentPathForRender';
import { FrontComponentRenderer } from '@/host/components/FrontComponentRenderer';
import { INVENTORY_FIXTURE_PROTOCOL } from '../../../scripts/compatibility/constants/INVENTORY_FIXTURE_PROTOCOL';
import { type InventorySandboxRuntime } from '../../../scripts/compatibility/types/InventorySandboxRuntime';
import { CompatibilityInventoryLoaderEffect } from './CompatibilityInventoryLoaderEffect';

const COMPATIBILITY_EXECUTION_CONTEXT: FrontComponentExecutionContext = {
  userId: null,
  recordId: null,
  selectedRecordIds: [],
  timelineActivityId: null,
  colorScheme: 'light',
  frontComponentId: INVENTORY_FIXTURE_PROTOCOL.frontComponentId,
};

type CompatibilityInventoryHarnessProps = { runtime: InventorySandboxRuntime };

export const CompatibilityInventoryHarness = ({
  runtime,
}: CompatibilityInventoryHarnessProps) => {
  const [applicationVariables, setApplicationVariables] = useState<Record<
    string,
    string
  > | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (isDefined(error)) {
    return (
      <pre data-testid={INVENTORY_FIXTURE_PROTOCOL.testIds.harnessError}>
        {error}
      </pre>
    );
  }

  return (
    <>
      <CompatibilityInventoryLoaderEffect
        runtime={runtime}
        setApplicationVariables={setApplicationVariables}
        setError={setError}
      />
      {isDefined(applicationVariables) && (
        <FrontComponentRenderer
          applicationAccessToken="fake-token"
          colorScheme="light"
          frontComponentHostCommunicationApi={hostApiMocks}
          componentUrl={getBuiltStoryComponentPathForRender(
            INVENTORY_FIXTURE_PROTOCOL.componentName,
            runtime,
          )}
          storageNamespace="compatibility-audit:"
          executionContext={COMPATIBILITY_EXECUTION_CONTEXT}
          applicationVariables={applicationVariables}
          onError={(failure) => setError(String(failure))}
        />
      )}
    </>
  );
};
