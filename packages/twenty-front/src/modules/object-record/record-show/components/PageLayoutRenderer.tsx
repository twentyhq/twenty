import { DashboardCard } from '@/dashboards/components/DashboardCard';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { RecordShowContainer } from '@/object-record/record-show/components/RecordShowContainer';
import { RecordShowContainerContextStoreTargetedRecordsEffect } from '@/object-record/record-show/components/RecordShowContainerContextStoreTargetedRecordsEffect';
import { RecordShowEffect } from '@/object-record/record-show/components/RecordShowEffect';
import { LayoutRenderingProvider } from '@/ui/layout/contexts/LayoutRenderingContext';
import { type TargetRecordIdentifier } from '@/ui/layout/contexts/TargetRecordIdentifier';
import { PageLayoutType } from '~/generated/graphql';

export const PageLayoutDispatcher = ({
  targetRecordIdentifier,
  isInRightDrawer = false,
}: {
  targetRecordIdentifier: TargetRecordIdentifier;
  isInRightDrawer?: boolean;
}) => {
  if (
    targetRecordIdentifier.targetObjectNameSingular ===
    CoreObjectNameSingular.Dashboard
  ) {
    return (
      <>
        <RecordShowEffect
          objectNameSingular={targetRecordIdentifier.targetObjectNameSingular}
          recordId={targetRecordIdentifier.id}
        />

        <RecordShowContainerContextStoreTargetedRecordsEffect
          recordId={targetRecordIdentifier.id}
        />

        <LayoutRenderingProvider
          value={{
            targetRecordIdentifier: {
              id: targetRecordIdentifier.id,
              targetObjectNameSingular:
                targetRecordIdentifier.targetObjectNameSingular,
            },
            layoutType: PageLayoutType.RECORD_PAGE,
            isInRightDrawer,
          }}
        >
          {/* We will use a generic LayoutPageRenderer here */}
          <DashboardCard />
        </LayoutRenderingProvider>
      </>
    );
  }

  return (
    <>
      <RecordShowEffect
        objectNameSingular={targetRecordIdentifier.targetObjectNameSingular}
        recordId={targetRecordIdentifier.id}
      />

      <LayoutRenderingProvider
        value={{
          targetRecordIdentifier: {
            id: targetRecordIdentifier.id,
            targetObjectNameSingular:
              targetRecordIdentifier.targetObjectNameSingular,
          },
          layoutType: PageLayoutType.RECORD_PAGE,
          isInRightDrawer,
        }}
      >
        <RecordShowContainer
          objectNameSingular={targetRecordIdentifier.targetObjectNameSingular}
          objectRecordId={targetRecordIdentifier.id}
          isInRightDrawer={isInRightDrawer}
        />
      </LayoutRenderingProvider>
    </>
  );
};
