import { useParams } from 'react-router-dom';
import { isDefined } from 'twenty-shared/utils';

import { WorkspaceRouteUnavailable } from '@/app/routing/components/WorkspaceRouteUnavailable';
import { SidePanelToggleButton } from '@/side-panel/components/SidePanelToggleButton';
import { RecordShowCommandMenu } from '@/command-menu-item/components/RecordShowCommandMenu';
import { CommandMenuComponentInstanceContext } from '@/command-menu/states/contexts/CommandMenuComponentInstanceContext';
import { TimelineActivityContext } from '@/activities/timeline-activities/contexts/TimelineActivityContext';
import { isLayoutCustomizationModeEnabledState } from '@/layout-customization/states/isLayoutCustomizationModeEnabledState';
import { RecordComponentInstanceContextsWrapper } from '@/object-record/components/RecordComponentInstanceContextsWrapper';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { PageLayoutRecordPageRenderer } from '@/object-record/record-show/components/PageLayoutRecordPageRenderer';
import { RecordShowPageSSESubscribeEffect } from '@/object-record/record-show/components/RecordShowPageSSESubscribeEffect';
import { useRecordShowPageResource } from '@/object-record/record-show/hooks/useRecordShowPageResource';
import { useRecordShowPage } from '@/object-record/record-show/hooks/useRecordShowPage';
import { computeRecordShowComponentInstanceId } from '@/object-record/record-show/utils/computeRecordShowComponentInstanceId';
import { useWorkspaceSurface } from '@/ui/layout/hooks/useWorkspaceSurface';
import { useWorkspaceSurfaceScopedComponentInstanceId } from '@/ui/layout/hooks/useWorkspaceSurfaceScopedComponentInstanceId';
import { PageCardLayout } from '@/ui/layout/page/components/PageCardLayout';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { RecordShowPageHeader } from '~/pages/object-record/RecordShowPageHeader';
import { RecordShowPageTitle } from '~/pages/object-record/RecordShowPageTitle';

type RecordShowPageParameters = {
  objectNameSingular?: string;
  objectRecordId?: string;
};

const RecordShowPageContent = ({
  parameters,
  isInSidePanel,
}: {
  parameters: RecordShowPageParameters;
  isInSidePanel: boolean;
}) => {
  const isLayoutCustomizationModeEnabled = useAtomStateValue(
    isLayoutCustomizationModeEnabledState,
  );

  const { objectNameSingular, objectRecordId } = useRecordShowPage(
    parameters.objectNameSingular ?? '',
    parameters.objectRecordId ?? '',
  );

  const { error, loading, record } = useRecordShowPageResource({
    objectNameSingular,
    recordId: objectRecordId,
  });

  const recordShowComponentInstanceId =
    useWorkspaceSurfaceScopedComponentInstanceId(
      computeRecordShowComponentInstanceId(objectRecordId),
    );

  if (isInSidePanel && !loading && (isDefined(error) || !isDefined(record))) {
    return <WorkspaceRouteUnavailable />;
  }

  const recordContent = (
    <TimelineActivityContext.Provider
      value={{
        recordId: objectRecordId,
      }}
    >
      <PageLayoutRecordPageRenderer
        targetRecordIdentifier={{
          id: objectRecordId,
          targetObjectNameSingular: objectNameSingular,
        }}
        isInSidePanel={isInSidePanel}
      />
      <RecordShowPageSSESubscribeEffect
        objectNameSingular={objectNameSingular}
        recordId={objectRecordId}
      />
    </TimelineActivityContext.Provider>
  );

  return (
    <RecordComponentInstanceContextsWrapper
      componentInstanceId={recordShowComponentInstanceId}
    >
      <CommandMenuComponentInstanceContext.Provider
        value={{ instanceId: recordShowComponentInstanceId }}
      >
        <RecordShowPageTitle
          objectNameSingular={objectNameSingular}
          objectRecordId={objectRecordId}
        />
        <PageCardLayout
          header={
            <RecordShowPageHeader
              objectNameSingular={objectNameSingular}
              objectRecordId={objectRecordId}
            >
              {!isInSidePanel && (
                <>
                  <RecordShowCommandMenu />
                  {!isLayoutCustomizationModeEnabled && (
                    <SidePanelToggleButton />
                  )}
                </>
              )}
            </RecordShowPageHeader>
          }
        >
          {recordContent}
        </PageCardLayout>
      </CommandMenuComponentInstanceContext.Provider>
    </RecordComponentInstanceContextsWrapper>
  );
};

export const RecordShowPage = () => {
  const parameters = useParams<RecordShowPageParameters>();
  const workspaceSurface = useWorkspaceSurface();
  const { objectMetadataItems } = useObjectMetadataItems();

  const isInSidePanel = workspaceSurface.type === 'side-panel';
  const isRouteObjectMetadataAvailable =
    isDefined(parameters.objectNameSingular) &&
    objectMetadataItems.some(
      (objectMetadataItem) =>
        objectMetadataItem.nameSingular === parameters.objectNameSingular,
    );

  if (isInSidePanel && !isRouteObjectMetadataAvailable) {
    return <WorkspaceRouteUnavailable />;
  }

  return (
    <RecordShowPageContent
      parameters={parameters}
      isInSidePanel={isInSidePanel}
    />
  );
};
