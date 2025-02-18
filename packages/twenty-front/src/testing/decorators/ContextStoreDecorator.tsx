import { Decorator } from '@storybook/react';
import { useEffect, useState } from 'react';

import { contextStoreCurrentObjectMetadataItemComponentState } from '@/context-store/states/contextStoreCurrentObjectMetadataItemComponentState';
import { ContextStoreComponentInstanceContext } from '@/context-store/states/contexts/ContextStoreComponentInstanceContext';
import { useSetRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentStateV2';
import { isUndefined } from '@sniptt/guards';
import { getCompanyObjectMetadataItem } from '~/testing/mock-data/companies';

export const ContextStoreDecorator: Decorator = (Story, context) => {
  const { contextStore } = context.parameters;

  let componentInstanceId = contextStore?.componentInstanceId;

  if (isUndefined(componentInstanceId)) {
    componentInstanceId = 'main-context-store';
  }

  const setCurrentObjectMetadataItem = useSetRecoilComponentStateV2(
    contextStoreCurrentObjectMetadataItemComponentState,
    componentInstanceId,
  );

  const [isLoaded, setIsLoaded] = useState(false);

  const objectMetadataItem = getCompanyObjectMetadataItem();

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
