import { contextStoreCurrentViewTypeComponentState } from '@/context-store/states/contextStoreCurrentViewTypeComponentState';
import { ContextStoreViewType } from '@/context-store/types/ContextStoreViewType';
import { useSetRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentStateV2';
import { useEffect } from 'react';

export const ContextStoreCurrentViewTypeEffect = ({
  viewType,
}: {
  viewType: ContextStoreViewType | null;
}) => {
  const setContextStoreCurrentViewType = useSetRecoilComponentStateV2(
    contextStoreCurrentViewTypeComponentState,
  );

  useEffect(() => {
    setContextStoreCurrentViewType(viewType);

    return () => {
      setContextStoreCurrentViewType(null);
    };
  }, [setContextStoreCurrentViewType, viewType]);

  return null;
};
