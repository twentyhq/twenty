import { type Decorator } from '@storybook/react';
import { useEffect, useState } from 'react';

import { MAIN_CONTEXT_STORE_INSTANCE_ID } from '@/context-store/constants/MainContextStoreInstanceId';
import { contextStoreCurrentObjectMetadataItemIdComponentState } from '@/context-store/states/contextStoreCurrentObjectMetadataItemIdComponentState';
import { ContextStoreComponentInstanceContext } from '@/context-store/states/contexts/ContextStoreComponentInstanceContext';
import { useSetRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentState';
import { isUndefined } from '@sniptt/guards';
import { getMockCompanyObjectMetadataItem } from '~/testing/mock-data/companies';

export const ContextStoreDecorator: Decorator = (Story, context) => {
  const { contextStore } = context.parameters;

  let componentInstanceId = contextStore?.componentInstanceId;

  if (isUndefined(componentInstanceId)) {
    componentInstanceId = MAIN_CONTEXT_STORE_INSTANCE_ID;
  }

  const setCurrentObjectMetadataItemId = useSetRecoilComponentState(
    contextStoreCurrentObjectMetadataItemIdComponentState,
    componentInstanceId,
  );

  const [isLoaded, setIsLoaded] = useState(false);

  const objectMetadataItem = getMockCompanyObjectMetadataItem();

  useEffect(() => {
    setCurrentObjectMetadataItemId(objectMetadataItem.id);
    setIsLoaded(true);
  }, [setCurrentObjectMetadataItemId, objectMetadataItem]);

  return (
    <ContextStoreComponentInstanceContext.Provider
      value={{ instanceId: componentInstanceId }}
    >
      {isLoaded && <Story />}
    </ContextStoreComponentInstanceContext.Provider>
  );
};
