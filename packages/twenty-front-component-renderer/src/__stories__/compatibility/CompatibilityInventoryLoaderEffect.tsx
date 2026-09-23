import { useEffect } from 'react';

import { INVENTORY_FIXTURE_PROTOCOL } from '../../../scripts/compatibility/constants/INVENTORY_FIXTURE_PROTOCOL';
import { inventoryCatalogSchema } from '../../../scripts/compatibility/schemas/inventoryCatalogSchema';
import { type InventorySandboxRuntime } from '../../../scripts/compatibility/types/InventorySandboxRuntime';

type CompatibilityInventoryLoaderEffectProps = {
  runtime: InventorySandboxRuntime;
  setApplicationVariables: (
    applicationVariables: Record<string, string>,
  ) => void;
  setError: (error: string) => void;
};

export const CompatibilityInventoryLoaderEffect = ({
  runtime,
  setApplicationVariables,
  setError,
}: CompatibilityInventoryLoaderEffectProps) => {
  useEffect(() => {
    const controller = new AbortController();
    const loadCatalog = async () => {
      try {
        const response = await fetch('/compatibility-catalog.json', {
          signal: controller.signal,
        });
        if (!response.ok) {
          throw new Error(
            'Run the compatibility:audit target to supply the browser reference catalog',
          );
        }
        const catalog = inventoryCatalogSchema.parse(await response.json());
        localStorage.setItem('compatibility-audit:ready', 'seeded');
        sessionStorage.setItem('compatibility-audit:ready', 'seeded');
        setApplicationVariables({
          [INVENTORY_FIXTURE_PROTOCOL.applicationVariables.catalog]:
            JSON.stringify(catalog),
          [INVENTORY_FIXTURE_PROTOCOL.applicationVariables.runtime]: runtime,
        });
      } catch (error) {
        if (!controller.signal.aborted) {
          setError(String(error));
        }
      }
    };
    void loadCatalog();
    return () => controller.abort();
  }, [runtime, setApplicationVariables, setError]);

  return null;
};
