import { useLoadMockedMinimalMetadata } from '@/metadata-store/hooks/useLoadMockedMinimalMetadata';
import { useMetadataStore } from '@/metadata-store/hooks/useMetadataStore';
import { useCallback } from 'react';

export const useReloadWorkspaceMetadata = () => {
  const { loadMockedMinimalMetadata } = useLoadMockedMinimalMetadata();
  const { resetMetadataStore } = useMetadataStore();

  const resetToMockedMetadata = useCallback(async () => {
    resetMetadataStore();

    await loadMockedMinimalMetadata();
  }, [resetMetadataStore, loadMockedMinimalMetadata]);

  return { resetToMockedMetadata };
};
