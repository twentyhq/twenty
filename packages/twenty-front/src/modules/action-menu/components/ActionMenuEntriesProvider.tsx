import { EmptyActionMenuEntriesEffect } from '@/action-menu/components/EmptyActionMenuEntriesEffect';
import { NonEmptyActionMenuEntriesEffect } from '@/action-menu/components/NonEmptyActionMenuEntriesEffect';
import { contextStoreCurrentObjectMetadataIdState } from '@/context-store/states/contextStoreCurrentObjectMetadataIdState';
import { useRecoilValue } from 'recoil';

export const ActionMenuEntriesProvider = () => {
  //TODO: Refactor this
  const contextStoreCurrentObjectMetadataId = useRecoilValue(
    contextStoreCurrentObjectMetadataIdState,
  );

  return (
    <>
      {contextStoreCurrentObjectMetadataId ? (
        <NonEmptyActionMenuEntriesEffect
          contextStoreCurrentObjectMetadataId={
            contextStoreCurrentObjectMetadataId
          }
        />
      ) : (
        <EmptyActionMenuEntriesEffect />
      )}
    </>
  );
};
