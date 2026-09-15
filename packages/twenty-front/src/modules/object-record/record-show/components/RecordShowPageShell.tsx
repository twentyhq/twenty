import { type ErrorLike } from '@apollo/client';
import { isDefined } from 'twenty-shared/utils';

import { TimelineActivityContext } from '@/activities/timeline-activities/contexts/TimelineActivityContext';
import { WorkspaceRouteUnavailable } from '@/app/routing/components/WorkspaceRouteUnavailable';
import { RecordShowCommandMenu } from '@/command-menu-item/components/RecordShowCommandMenu';
import { CommandMenuComponentInstanceContext } from '@/command-menu/states/contexts/CommandMenuComponentInstanceContext';
import { isLayoutCustomizationModeEnabledState } from '@/layout-customization/states/isLayoutCustomizationModeEnabledState';
import { RecordComponentInstanceContextsWrapper } from '@/object-record/components/RecordComponentInstanceContextsWrapper';
import { PageLayoutRecordPageRenderer } from '@/object-record/record-show/components/PageLayoutRecordPageRenderer';
import { RecordShowPageResourceEffect } from '@/object-record/record-show/components/RecordShowPageResourceEffect';
import { RecordShowPageSSESubscribeEffect } from '@/object-record/record-show/components/RecordShowPageSSESubscribeEffect';
import { computeRecordShowComponentInstanceId } from '@/object-record/record-show/utils/computeRecordShowComponentInstanceId';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { SidePanelToggleButton } from '@/side-panel/components/SidePanelToggleButton';
import { useWorkspaceSurface } from '@/ui/layout/hooks/useWorkspaceSurface';
import { useWorkspaceSurfaceScopedComponentInstanceId } from '@/ui/layout/hooks/useWorkspaceSurfaceScopedComponentInstanceId';
import { PageCardLayout } from '@/ui/layout/page/components/PageCardLayout';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { RecordShowPageHeader } from '~/pages/object-record/RecordShowPageHeader';
import { RecordShowPageTitle } from '~/pages/object-record/RecordShowPageTitle';

type RecordShowPageShellProps = {
  objectNameSingular: string;
  objectRecordId: string;
  record: ObjectRecord | undefined;
  loading: boolean;
  error?: ErrorLike;
};

export const RecordShowPageShell = ({
  objectNameSingular,
  objectRecordId,
  record,
  loading,
  error,
}: RecordShowPageShellProps) => {
  const isInSidePanel = useWorkspaceSurface().type === 'side-panel';
  const isLayoutCustomizationModeEnabled = useAtomStateValue(
    isLayoutCustomizationModeEnabledState,
  );

  const recordShowComponentInstanceId =
    useWorkspaceSurfaceScopedComponentInstanceId(
      computeRecordShowComponentInstanceId(objectRecordId),
    );

  const resourceEffect = (
    <RecordShowPageResourceEffect
      loading={loading}
      record={record}
      recordId={objectRecordId}
    />
  );

  if (isInSidePanel && !loading && (isDefined(error) || !isDefined(record))) {
    return (
      <>
        {resourceEffect}
        <WorkspaceRouteUnavailable />
      </>
    );
  }

  return (
    <RecordComponentInstanceContextsWrapper
      componentInstanceId={recordShowComponentInstanceId}
    >
      <CommandMenuComponentInstanceContext.Provider
        value={{ instanceId: recordShowComponentInstanceId }}
      >
        {resourceEffect}
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
