import { pageLayoutEditingWidgetIdComponentState } from '@/page-layout/states/pageLayoutEditingWidgetIdComponentState';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { WidgetSkeletonLoader } from '@/page-layout/widgets/components/WidgetSkeletonLoader';
import { RecordTableWidgetRendererContent } from '@/page-layout/widgets/record-table/components/RecordTableWidgetRendererContent';
import { useHasEnteredViewport } from '@/ui/utilities/viewport/hooks/useHasEnteredViewport';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { styled } from '@linaria/react';
import { useEffect, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { WidgetConfigurationType } from '~/generated-metadata/graphql';

const StyledLazyMountContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  width: 100%;
`;

type RecordTableWidgetRendererProps = {
  widget: PageLayoutWidget;
};

export const RecordTableWidgetRenderer = ({
  widget,
}: RecordTableWidgetRendererProps) => {
  const { configuration } = widget;

  const { elementRef, hasEnteredViewport } = useHasEnteredViewport();

  const pageLayoutEditingWidgetId = useAtomComponentStateValue(
    pageLayoutEditingWidgetIdComponentState,
  );
  const isWidgetInEditMode = pageLayoutEditingWidgetId === widget.id;

  // View widgets fire their own record queries (and one aggregate per
  // group on kanban/grouped layouts), so below-fold widgets stay
  // unmounted until they first become visible. Mounting is sticky and
  // the widget under edit always mounts so its side panel preview works.
  const shouldMountContent = hasEnteredViewport || isWidgetInEditMode;

  const [hasMountedContentOnce, setHasMountedContentOnce] = useState(false);

  useEffect(() => {
    if (shouldMountContent) {
      setHasMountedContentOnce(true);
    }
  }, [shouldMountContent]);

  const isRecordTableConfiguration =
    configuration.configurationType === WidgetConfigurationType.RECORD_TABLE;

  const viewId =
    isRecordTableConfiguration && 'viewId' in configuration
      ? (configuration.viewId as string | undefined)
      : undefined;

  const recordLimit =
    isRecordTableConfiguration && 'recordLimit' in configuration
      ? (configuration.recordLimit as number | undefined)
      : undefined;

  if (!isDefined(widget.objectMetadataId) || !isDefined(viewId)) {
    return null;
  }

  return (
    <StyledLazyMountContainer ref={elementRef}>
      {shouldMountContent || hasMountedContentOnce ? (
        <RecordTableWidgetRendererContent
          objectMetadataId={widget.objectMetadataId}
          viewId={viewId}
          widgetId={widget.id}
          isEmptyStateHidden
          recordLimit={recordLimit}
        />
      ) : (
        <WidgetSkeletonLoader />
      )}
    </StyledLazyMountContainer>
  );
};
