import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { PageLayoutRecordPageRenderer } from '@/object-record/record-show/components/PageLayoutRecordPageRenderer';
import { RecordShowContainer } from '@/object-record/record-show/components/RecordShowContainer';
import { RecordShowEffect } from '@/object-record/record-show/components/RecordShowEffect';
import { LayoutRenderingProvider } from '@/ui/layout/contexts/LayoutRenderingContext';
import { type TargetRecordIdentifier } from '@/ui/layout/contexts/TargetRecordIdentifier';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { FeatureFlagKey, PageLayoutType } from '~/generated/graphql';

export const PageLayoutDispatcher = ({
  targetRecordIdentifier,
  isInRightDrawer = false,
}: {
  targetRecordIdentifier: TargetRecordIdentifier;
  isInRightDrawer?: boolean;
}) => {
  const isRecordPageEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_RECORD_PAGE_LAYOUT_ENABLED,
  );

  if (
    targetRecordIdentifier.targetObjectNameSingular ===
      CoreObjectNameSingular.Dashboard ||
    isRecordPageEnabled
  ) {
    return (
      <PageLayoutRecordPageRenderer
        targetRecordIdentifier={targetRecordIdentifier}
        isInRightDrawer={isInRightDrawer}
      />
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
