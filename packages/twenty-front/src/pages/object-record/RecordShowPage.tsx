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

  // The same record open on both sides would otherwise share one instance, so
  // its fields, filters, tabs and command menu would cross-write.
  const recordShowComponentInstanceId = useSurfaceScopedComponentInstanceId(
    computeRecordShowComponentInstanceId(objectRecordId),
  );

  const isInSidePanelRoutedSurface = useIsInSidePanelRoutedSurface();

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
              <RecordShowCommandMenu />
              {!isLayoutCustomizationModeEnabled && <SidePanelToggleButton />}
            </RecordShowPageHeader>
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
