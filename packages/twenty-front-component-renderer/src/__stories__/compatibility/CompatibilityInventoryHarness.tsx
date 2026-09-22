import { isDefined } from 'twenty-shared/utils';
import { useState } from 'react';

import { hostApiMocks } from '@/__stories__/shared/test-utils/createFrontComponentStoryMeta';
import { getBuiltStoryComponentPathForRender } from '@/__stories__/utils/getBuiltStoryComponentPathForRender';
import { FrontComponentRenderer } from '@/host/components/FrontComponentRenderer';
import { CompatibilityInventoryLoaderEffect } from './CompatibilityInventoryLoaderEffect';

type CompatibilityInventoryHarnessProps = { runtime: 'react' | 'preact' };

export const CompatibilityInventoryHarness = ({
  runtime,
}: CompatibilityInventoryHarnessProps) => {
  const [catalog, setCatalog] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  return (
    <>
      <CompatibilityInventoryLoaderEffect
        setCatalog={setCatalog}
        setError={setError}
      />
      {isDefined(error) && <pre data-testid="compatibility-error">{error}</pre>}
      {isDefined(catalog) && (
        <FrontComponentRenderer
          applicationAccessToken="fake-token"
          colorScheme="light"
          frontComponentHostCommunicationApi={hostApiMocks}
          componentUrl={getBuiltStoryComponentPathForRender(
            'compatibility-inventory.front-component',
            runtime,
          )}
          storageNamespace="compatibility-audit:"
          executionContext={{
            userId: null,
            recordId: null,
            selectedRecordIds: [],
            timelineActivityId: null,
            colorScheme: 'light',
            frontComponentId: 'compatibility-audit',
          }}
          applicationVariables={{
            COMPATIBILITY_CATALOG: catalog,
            COMPATIBILITY_RUNTIME: runtime,
          }}
          onError={(failure) => setError(String(failure))}
        />
      )}
    </>
  );
};
