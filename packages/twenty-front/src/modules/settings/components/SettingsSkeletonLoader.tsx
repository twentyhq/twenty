import { isLayoutCustomizationModeEnabledState } from '@/layout-customization/states/isLayoutCustomizationModeEnabledState';
import { SidePanelToggleButton } from '@/side-panel/components/SidePanelToggleButton';
import { SkeletonLine } from '@/ui/feedback/skeleton/components/SkeletonLine';
import { useWorkspaceSurface } from '@/ui/layout/hooks/useWorkspaceSurface';
import { PageCardHeader } from '@/ui/layout/page/components/PageCardHeader';
import { PageCardLayout } from '@/ui/layout/page/components/PageCardLayout';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { SKELETON_HEIGHT_SIZES } from 'twenty-ui/primitives/feedback';

export const SettingsSkeletonLoader = () => {
  const isInMainSurface = useWorkspaceSurface().type === 'main';
  const isLayoutCustomizationModeEnabled = useAtomStateValue(
    isLayoutCustomizationModeEnabledState,
  );

  return (
    <PageCardLayout
      header={
        <PageCardHeader
          links={[
            {
              children: (
                <SkeletonLine width={64} height={SKELETON_HEIGHT_SIZES.s} />
              ),
            },
          ]}
          title={<SkeletonLine width={120} height={SKELETON_HEIGHT_SIZES.s} />}
          actionButton={
            isInMainSurface && !isLayoutCustomizationModeEnabled ? (
              <SidePanelToggleButton />
            ) : undefined
          }
        />
      }
      showInformationBanner={false}
    >
      {null}
    </PageCardLayout>
  );
};
