import { useLoadMockedMetadata } from '~/testing/hooks/useLoadMockedMetadata';
import { isMinimalMetadataReadyState } from '@/metadata-store/states/isMinimalMetadataReadyState';
import { metadataStoreState } from '@/metadata-store/states/metadataStoreState';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { useEffect } from 'react';

export const MockedMetadataLoadEffect = () => {
  const { loadMockedMetadataAtomic } = useLoadMockedMetadata();
  const metadataStore = useAtomFamilyStateValue(
    metadataStoreState,
    'objectMetadataItems',
  );
  const setIsMinimalMetadataReady = useSetAtomState(
    isMinimalMetadataReadyState,
  );

  useEffect(() => {
    void loadMockedMetadataAtomic();
  }, [loadMockedMetadataAtomic]);

  useEffect(() => {
    if (metadataStore.status === 'up-to-date') {
      setIsMinimalMetadataReady(true);
    } else {
      setIsMinimalMetadataReady(false);
    }
  }, [metadataStore.status, setIsMinimalMetadataReady]);

  return null;
};
