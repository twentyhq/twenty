import { isHiddenWorkspaceWorkflowRunRelationField } from '@/object-core/workflows/utils/isHiddenWorkspaceWorkflowRunRelationField';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { type WidgetVisibilityContext } from '@/page-layout/types/WidgetVisibilityContext';
import { buildWidgetVisibilityContext } from '@/page-layout/utils/buildWidgetVisibilityContext';
import { useLayoutRenderingContext } from '@/ui/layout/contexts/LayoutRenderingContext';
import { useWorkspaceSurface } from '@/ui/layout/hooks/useWorkspaceSurface';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { useMemo } from 'react';
import { FeatureFlagKey } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { useIsMobile } from 'twenty-ui/utilities';

// The one place widget visibility is derived. Every consumer reads the same
// context, so a widget cannot be visible to one caller and hidden from another
// — which is what makes "is this widget last in its tab" agree with "which
// widgets does this tab render".
export const useWidgetVisibilityContext = (): WidgetVisibilityContext => {
  const isMobile = useIsMobile();
  const { targetRecordIdentifier } = useLayoutRenderingContext();
  const isInSidePanel = useWorkspaceSurface().type === 'side-panel';

  const recordStore = useAtomFamilyStateValue(
    recordStoreFamilyState,
    targetRecordIdentifier?.id ?? '',
  );

  const { objectMetadataItems } = useObjectMetadataItems();

  const isWorkflowCoreIndexPageEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_WORKFLOW_CORE_INDEX_PAGE_ENABLED,
  );

  const targetObjectNameSingular =
    targetRecordIdentifier?.targetObjectNameSingular;

  const hiddenFieldMetadataIdsOrNames = useMemo(
    () =>
      (
        objectMetadataItems.find(
          (objectMetadataItem) =>
            objectMetadataItem.nameSingular === targetObjectNameSingular,
        )?.fields ?? []
      )
        .filter((field) =>
          isHiddenWorkspaceWorkflowRunRelationField({
            objectNameSingular: targetObjectNameSingular,
            fieldName: field.name,
            isWorkflowCoreIndexPageEnabled,
          }),
        )
        .flatMap((field) => [field.id, field.name]),
    [
      objectMetadataItems,
      targetObjectNameSingular,
      isWorkflowCoreIndexPageEnabled,
    ],
  );

  return useMemo(
    () => ({
      ...buildWidgetVisibilityContext({
        isMobile,
        isInSidePanel,
        targetRecord: isDefined(recordStore) ? recordStore : undefined,
      }),
      hiddenFieldMetadataIdsOrNames,
    }),
    [isMobile, isInSidePanel, recordStore, hiddenFieldMetadataIdsOrNames],
  );
};
