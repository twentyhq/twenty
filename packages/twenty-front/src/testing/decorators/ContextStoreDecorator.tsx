import { Decorator } from '@storybook/react';
import { useEffect, useState } from 'react';

import { MAIN_CONTEXT_STORE_INSTANCE_ID } from '@/context-store/constants/MainContextStoreInstanceId';
import { contextStoreCurrentObjectMetadataItemComponentState } from '@/context-store/states/contextStoreCurrentObjectMetadataItemComponentState';
import { ContextStoreComponentInstanceContext } from '@/context-store/states/contexts/ContextStoreComponentInstanceContext';
import { useSetRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentStateV2';
import { isUndefined } from '@sniptt/guards';
import { getMockCompanyObjectMetadataItem } from '~/testing/mock-data/companies';

export const ContextStoreDecorator: Decorator = (Story, context) => {
  const { contextStore } = context.parameters;

  let componentInstanceId = contextStore?.componentInstanceId;

  if (isUndefined(componentInstanceId)) {
    componentInstanceId = MAIN_CONTEXT_STORE_INSTANCE_ID;
  }

  const setCurrentObjectMetadataItem = useSetRecoilComponentStateV2(
    contextStoreCurrentObjectMetadataItemComponentState,
    componentInstanceId,
  );

  const [isLoaded, setIsLoaded] = useState(false);

  const objectMetadataItem = getMockCompanyObjectMetadataItem();

  useEffect(() => {
    setCurrentObjectMetadataItem(objectMetadataItem);
    setIsLoaded(true);
  }, [setCurrentObjectMetadataItem, objectMetadataItem]);

  return (
    <ContextStoreComponentInstanceContext.Provider
      value={{ instanceId: componentInstanceId }}
    >
      {isLoaded && <Story />}
    </ContextStoreComponentInstanceContext.Provider>
  );
};
