import { useEffect } from 'react';

import { inventoryCatalogSchema } from '../../../scripts/compatibility/schemas/inventoryCatalogSchema';

type CompatibilityInventoryLoaderEffectProps = {
  setCatalog: (catalog: string) => void;
  setError: (error: string) => void;
};

export const CompatibilityInventoryLoaderEffect = ({
  setCatalog,
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
        setCatalog(JSON.stringify(catalog));
      } catch (error) {
        if (!controller.signal.aborted) {
          setError(String(error));
        }
      }
    };
    void loadCatalog();
    return () => controller.abort();
  }, [setCatalog, setError]);

  return null;
};
