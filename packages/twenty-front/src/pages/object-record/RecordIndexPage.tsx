import { isChatbotEnabledState } from '@/client-config/states/isChatbotEnabledState';
import { MAIN_CONTEXT_STORE_INSTANCE_ID } from '@/context-store/constants/MainContextStoreInstanceId';
import { contextStoreCurrentObjectMetadataItemIdComponentState } from '@/context-store/states/contextStoreCurrentObjectMetadataItemIdComponentState';
import { ContextStoreComponentInstanceContext } from '@/context-store/states/contexts/ContextStoreComponentInstanceContext';
import { useRedirect } from '@/domain-manager/hooks/useRedirect';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { CoreObjectNamePlural } from '@/object-metadata/types/CoreObjectNamePlural';
import { RecordIndexContainerGater } from '@/object-record/record-index/components/RecordIndexContainerGater';
import { AppPath } from '@/types/AppPath';
import { PageContainer } from '@/ui/layout/page/components/PageContainer';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { isUndefined } from '@sniptt/guards';
import { useRecoilValue } from 'recoil';

export const RecordIndexPage = () => {
  const contextStoreCurrentObjectMetadataItemId = useRecoilComponentValueV2(
    contextStoreCurrentObjectMetadataItemIdComponentState,
    MAIN_CONTEXT_STORE_INSTANCE_ID,
  );

  const isChatbotEnabled = useRecoilValue(isChatbotEnabledState);

  const { redirect } = useRedirect();

  const { objectMetadataItems } = useObjectMetadataItems();

  if (isUndefined(contextStoreCurrentObjectMetadataItemId)) {
    return <></>;
  }

  const objectMetadataItem = objectMetadataItems.find(
    (objectMetadataItem) =>
      objectMetadataItem.id === contextStoreCurrentObjectMetadataItemId,
  );

  if (isUndefined(objectMetadataItem)) {
    return <></>;
  }

  const isChatbot =
    objectMetadataItem.namePlural === CoreObjectNamePlural.Chatbot;

  if (!isChatbotEnabled && isChatbot) {
    redirect(
      AppPath.RecordIndexPage.replace(
        ':objectNamePlural',
        CoreObjectNamePlural.Person,
      ),
    );

    return <></>;
  }

  return (
    <PageContainer>
      <ContextStoreComponentInstanceContext.Provider
        value={{
          instanceId: MAIN_CONTEXT_STORE_INSTANCE_ID,
        }}
      >
        <RecordIndexContainerGater />
      </ContextStoreComponentInstanceContext.Provider>
    </PageContainer>
  );
};
