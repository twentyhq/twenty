import { useEffect } from 'react';
import { useParams } from 'react-router-dom';

import { TimelineActivityContext } from '@/activities/timeline-activities/contexts/TimelineActivityContext';
import { RecordShowCommandMenu } from '@/command-menu-item/components/RecordShowCommandMenu';
import { CommandMenuComponentInstanceContext } from '@/command-menu/states/contexts/CommandMenuComponentInstanceContext';
import { MAIN_CONTEXT_STORE_INSTANCE_ID } from '@/context-store/constants/MainContextStoreInstanceId';
import { ContextStoreComponentInstanceContext } from '@/context-store/states/contexts/ContextStoreComponentInstanceContext';
import { isLayoutCustomizationModeEnabledState } from '@/layout-customization/states/isLayoutCustomizationModeEnabledState';
import { objectMetadataItemFamilySelector } from '@/object-metadata/states/objectMetadataItemFamilySelector';
import { MainContainerLayoutWithSidePanel } from '@/object-record/components/MainContainerLayoutWithSidePanel';
import { RecordComponentInstanceContextsWrapper } from '@/object-record/components/RecordComponentInstanceContextsWrapper';
import { PageLayoutRecordPageRenderer } from '@/object-record/record-show/components/PageLayoutRecordPageRenderer';
import { RecordShowPageSSESubscribeEffect } from '@/object-record/record-show/components/RecordShowPageSSESubscribeEffect';
import { useRecordShowPage } from '@/object-record/record-show/hooks/useRecordShowPage';
import { computeRecordShowComponentInstanceId } from '@/object-record/record-show/utils/computeRecordShowComponentInstanceId';
import { SidePanelToggleButton } from '@/side-panel/components/SidePanelToggleButton';
import { PageContainer } from '@/ui/layout/page/components/PageContainer';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { AppPath } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { useNavigateApp } from '~/hooks/useNavigateApp';
import { RecordShowPageHeader } from '~/pages/object-record/RecordShowPageHeader';
import { RecordShowPageTitle } from '~/pages/object-record/RecordShowPageTitle';

export const RecordShowPage = () => {
  const isLayoutCustomizationModeEnabled = useAtomStateValue(
    isLayoutCustomizationModeEnabledState,
  );
  const navigateApp = useNavigateApp();

  const parameters = useParams<{
    objectNameSingular: string;
    objectRecordId: string;
  }>();

  const objectNameSingular = parameters.objectNameSingular ?? '';
  const objectRecordId = parameters.objectRecordId ?? '';

  const objectMetadataItem = useAtomFamilySelectorValue(
    objectMetadataItemFamilySelector,
    {
      objectName: objectNameSingular,
      objectNameType: 'singular',
    },
  );

  useEffect(() => {
    if (
      isDefined(parameters.objectNameSingular) &&
      !isDefined(objectMetadataItem)
    ) {
      navigateApp(AppPath.NotFound);
    }
  }, [navigateApp, objectMetadataItem, parameters.objectNameSingular]);

  if (!isDefined(objectMetadataItem)) {
    return null;
  }

  const {
    objectNameSingular: validatedObjectNameSingular,
    objectRecordId: validatedObjectRecordId,
  } = useRecordShowPage(objectNameSingular, objectRecordId);

  const recordShowComponentInstanceId =
    computeRecordShowComponentInstanceId(validatedObjectRecordId);

  return (
    <RecordComponentInstanceContextsWrapper
      componentInstanceId={recordShowComponentInstanceId}
    >
      <ContextStoreComponentInstanceContext.Provider
        value={{ instanceId: MAIN_CONTEXT_STORE_INSTANCE_ID }}
      >
        <CommandMenuComponentInstanceContext.Provider
          value={{ instanceId: recordShowComponentInstanceId }}
        >
          <PageContainer>
            <RecordShowPageTitle
              objectNameSingular={validatedObjectNameSingular}
              objectRecordId={validatedObjectRecordId}
            />
            <RecordShowPageHeader
              objectNameSingular={validatedObjectNameSingular}
              objectRecordId={validatedObjectRecordId}
            >
              <RecordShowCommandMenu />
              {!isLayoutCustomizationModeEnabled && <SidePanelToggleButton />}
            </RecordShowPageHeader>
            <MainContainerLayoutWithSidePanel>
              <TimelineActivityContext.Provider
                value={{
                  recordId: validatedObjectRecordId,
                }}
              >
                <PageLayoutRecordPageRenderer
                  targetRecordIdentifier={{
                    id: validatedObjectRecordId,
                    targetObjectNameSingular: validatedObjectNameSingular,
                  }}
                  isInSidePanel={false}
                />
                <RecordShowPageSSESubscribeEffect
                  objectNameSingular={validatedObjectNameSingular}
                  recordId={validatedObjectRecordId}
                />
              </TimelineActivityContext.Provider>
            </MainContainerLayoutWithSidePanel>
          </PageContainer>
        </CommandMenuComponentInstanceContext.Provider>
      </ContextStoreComponentInstanceContext.Provider>
    </RecordComponentInstanceContextsWrapper>
  );
};
