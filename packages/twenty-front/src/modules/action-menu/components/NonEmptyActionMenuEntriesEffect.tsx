import { useComputeActionsBasedOnContextStore } from '@/action-menu/hooks/useComputeActionsBasedOnContextStore';
import { actionMenuEntriesComponentState } from '@/action-menu/states/actionMenuEntriesComponentState';
import { useObjectMetadataItemById } from '@/object-metadata/hooks/useObjectMetadataItemById';
import { useSetRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentStateV2';
import { useEffect } from 'react';

export const NonEmptyActionMenuEntriesEffect = ({
  contextStoreCurrentObjectMetadataId,
}: {
  contextStoreCurrentObjectMetadataId: string;
}) => {
  const { objectMetadataItem } = useObjectMetadataItemById({
    objectId: contextStoreCurrentObjectMetadataId,
  });
  const { availableActionsInContext } = useComputeActionsBasedOnContextStore({
    objectMetadataItem,
  });

  const setActionMenuEntries = useSetRecoilComponentStateV2(
    actionMenuEntriesComponentState,
  );

  useEffect(() => {
    setActionMenuEntries(availableActionsInContext);
  }, [availableActionsInContext, setActionMenuEntries]);

  return null;
};
