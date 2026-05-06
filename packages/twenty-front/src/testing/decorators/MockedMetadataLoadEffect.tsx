import { useLoadMockedMetadata } from '@/metadata-store/hooks/useLoadMockedMetadata';
import { isMinimalMetadataReadyState } from '@/metadata-store/states/isMinimalMetadataReadyState';
import { metadataStoreState } from '@/metadata-store/states/metadataStoreState';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { useEffect } from 'react';

// Storybook-only effect: in production we no longer load mock metadata for
// signed-out users, but our storybook tests render pages that require object
// metadata (e.g. SettingsAccountsBlocklistSection looking up the "blocklist"
// object). Load the mocked metadata snapshot up-front, and only flip the
// ready flag once it's actually in place so MinimalMetadataGater doesn't let
// pages render against an empty store.
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
