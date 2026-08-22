import { RECORD_TABLE_WIDGET_CONTENT_EDITABLE_DEFAULT } from '@/page-layout/constants/RecordTableWidgetContentEditableDefault';
import { useIsPageLayoutInEditMode } from '@/page-layout/hooks/useIsPageLayoutInEditMode';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { RecordTableWidgetRendererContent } from '@/page-layout/widgets/record-table/components/RecordTableWidgetRendererContent';
import { isDefined } from 'twenty-shared/utils';
import { WidgetConfigurationType } from '~/generated-metadata/graphql';

type RecordTableWidgetRendererProps = {
  widget: PageLayoutWidget;
};

export const RecordTableWidgetRenderer = ({
  widget,
}: RecordTableWidgetRendererProps) => {
  const { configuration } = widget;

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

  const isWidgetContentEditable =
    isRecordTableConfiguration && 'isWidgetContentEditable' in configuration
      ? (configuration.isWidgetContentEditable ??
        RECORD_TABLE_WIDGET_CONTENT_EDITABLE_DEFAULT)
      : RECORD_TABLE_WIDGET_CONTENT_EDITABLE_DEFAULT;

  if (!isDefined(widget.objectMetadataId) || !isDefined(viewId)) {
    return null;
  }

  return (
    <RecordTableWidgetRendererContent
      objectMetadataId={widget.objectMetadataId}
      viewId={viewId}
      widgetId={widget.id}
      isEmptyStateHidden
      recordLimit={recordLimit}
      isWidgetContentEditable={
        !isPageLayoutInEditMode && isWidgetContentEditable
      }
    />
  );
};
