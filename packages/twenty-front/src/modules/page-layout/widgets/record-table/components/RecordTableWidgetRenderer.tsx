import { useCurrentPageLayoutOrThrow } from '@/page-layout/hooks/useCurrentPageLayoutOrThrow';
import { useIsPageLayoutInEditMode } from '@/page-layout/hooks/useIsPageLayoutInEditMode';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { StyledWidgetTableOutline } from '@/page-layout/widgets/components/WidgetContentFrame';
import { RecordTableWidgetRendererContent } from '@/page-layout/widgets/record-table/components/RecordTableWidgetRendererContent';
import { getRecordTableWidgetIsUIEditable } from '@/page-layout/widgets/record-table/utils/getRecordTableWidgetIsUIEditable';
import { isDefined } from 'twenty-shared/utils';
import { WidgetConfigurationType } from '~/generated-metadata/graphql';

type RecordTableWidgetRendererProps = {
  widget: PageLayoutWidget;
};

export const RecordTableWidgetRenderer = ({
  widget,
}: RecordTableWidgetRendererProps) => {
  const { configuration } = widget;

  const { currentPageLayout } = useCurrentPageLayoutOrThrow();
  const isPageLayoutInEditMode = useIsPageLayoutInEditMode();

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

  const isUIEditable = getRecordTableWidgetIsUIEditable(
    configuration,
    currentPageLayout.type,
  );

  if (!isDefined(widget.objectMetadataId) || !isDefined(viewId)) {
    return null;
  }

  return (
    <StyledWidgetTableOutline>
      <RecordTableWidgetRendererContent
        objectMetadataId={widget.objectMetadataId}
        viewId={viewId}
        widgetId={widget.id}
        isEmptyStateHidden
        recordLimit={recordLimit}
        isUIEditable={!isPageLayoutInEditMode && isUIEditable}
      />
    </StyledWidgetTableOutline>
  );
};
