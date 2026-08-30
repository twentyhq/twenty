import { useParams } from 'react-router-dom';

import { SidePanelToggleButton } from '@/side-panel/components/SidePanelToggleButton';
import { RecordShowCommandMenu } from '@/command-menu-item/components/RecordShowCommandMenu';
import { CommandMenuComponentInstanceContext } from '@/command-menu/states/contexts/CommandMenuComponentInstanceContext';
import { TimelineActivityContext } from '@/activities/timeline-activities/contexts/TimelineActivityContext';
import { isLayoutCustomizationModeEnabledState } from '@/layout-customization/states/isLayoutCustomizationModeEnabledState';
import { RecordComponentInstanceContextsWrapper } from '@/object-record/components/RecordComponentInstanceContextsWrapper';
import { PageLayoutRecordPageRenderer } from '@/object-record/record-show/components/PageLayoutRecordPageRenderer';
import { RecordShowPageSSESubscribeEffect } from '@/object-record/record-show/components/RecordShowPageSSESubscribeEffect';
import { useRecordShowPage } from '@/object-record/record-show/hooks/useRecordShowPage';
import { computeRecordShowComponentInstanceId } from '@/object-record/record-show/utils/computeRecordShowComponentInstanceId';
import { useIsInSidePanelRoutedSurface } from '@/side-panel/routing/hooks/useIsInSidePanelRoutedSurface';
import { useSurfaceScopedComponentInstanceId } from '@/side-panel/routing/hooks/useSurfaceScopedComponentInstanceId';
import { PageCardLayout } from '@/ui/layout/page/components/PageCardLayout';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { RecordShowPageHeader } from '~/pages/object-record/RecordShowPageHeader';
import { RecordShowPageTitle } from '~/pages/object-record/RecordShowPageTitle';

export const RecordShowPage = () => {
  const isLayoutCustomizationModeEnabled = useAtomStateValue(
    isLayoutCustomizationModeEnabledState,
  );

  const parameters = useParams<{
    objectNameSingular: string;
    objectRecordId: string;
  }>();

  const { objectNameSingular, objectRecordId } = useRecordShowPage(
    parameters.objectNameSingular ?? '',
    parameters.objectRecordId ?? '',
  );

  const recordShowComponentInstanceId =
    computeRecordShowComponentInstanceId(objectRecordId);

  const isInSidePanelRoutedSurface = useIsInSidePanelRoutedSurface();

  // The same record open on both sides would otherwise share one command menu.
  const commandMenuInstanceId = useSurfaceScopedComponentInstanceId(
    recordShowComponentInstanceId,
  );

  return (
    <RecordComponentInstanceContextsWrapper
      componentInstanceId={recordShowComponentInstanceId}
    >
      <CommandMenuComponentInstanceContext.Provider
        value={{ instanceId: commandMenuInstanceId }}
      >
        {!isInSidePanelRoutedSurface && (
          <RecordShowPageTitle
            objectNameSingular={objectNameSingular}
            objectRecordId={objectRecordId}
          />
        )}
        <PageCardLayout
          header={
            // The panel top bar already names the record it is hosting, and the
            // header's actions belong to a full width page.
            isInSidePanelRoutedSurface ? null : (
              <RecordShowPageHeader
                objectNameSingular={objectNameSingular}
                objectRecordId={objectRecordId}
              >
                <RecordShowCommandMenu />
                {!isLayoutCustomizationModeEnabled && <SidePanelToggleButton />}
              </RecordShowPageHeader>
            )
          }
        >
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
              isInSidePanel={isInSidePanelRoutedSurface}
            />
            <RecordShowPageSSESubscribeEffect
              objectNameSingular={objectNameSingular}
              recordId={objectRecordId}
            />
          </TimelineActivityContext.Provider>
        </PageCardLayout>
      </CommandMenuComponentInstanceContext.Provider>
    </RecordComponentInstanceContextsWrapper>
  );
};
