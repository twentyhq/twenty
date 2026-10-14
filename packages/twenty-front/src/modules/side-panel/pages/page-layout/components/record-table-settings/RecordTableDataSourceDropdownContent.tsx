import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { useUpdatePageLayoutWidget } from '@/page-layout/hooks/useUpdatePageLayoutWidget';
import { useAddDraftViewForRecordTableWidget } from '@/page-layout/widgets/record-table/hooks/useAddDraftViewForRecordTableWidget';
import { useRemoveDraftViewForRecordTableWidget } from '@/page-layout/widgets/record-table/hooks/useRemoveDraftViewForRecordTableWidget';
import { ObjectSourceDropdownContent } from '@/side-panel/pages/page-layout/components/dropdown-content/ObjectSourceDropdownContent';
import { usePageLayoutSidePanelTarget } from '@/side-panel/pages/page-layout/hooks/usePageLayoutSidePanelTarget';
import { useUpdateCurrentWidgetConfig } from '@/side-panel/pages/page-layout/hooks/useUpdateCurrentWidgetConfig';
import { useWidgetInEditMode } from '@/side-panel/pages/page-layout/hooks/useWidgetInEditMode';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { isDefined } from 'twenty-shared/utils';

export const RecordTableDataSourceDropdownContent = () => {
  const { objectMetadataItems } = useObjectMetadataItems();
  const { pageLayoutId } = usePageLayoutSidePanelTarget();
  const { widgetInEditMode } = useWidgetInEditMode(pageLayoutId);

  const currentObjectMetadataItemId = widgetInEditMode?.objectMetadataId as
    | string
    | undefined;

  const { updateCurrentWidgetConfig } =
    useUpdateCurrentWidgetConfig(pageLayoutId);

  const { addDraftViewForRecordTableWidget } =
    useAddDraftViewForRecordTableWidget(pageLayoutId);

  const { removeDraftViewForRecordTableWidget } =
    useRemoveDraftViewForRecordTableWidget(pageLayoutId);

  const { updatePageLayoutWidget } = useUpdatePageLayoutWidget(pageLayoutId);

  const { closeDropdown } = useCloseDropdown();

  const handleSelectSource = (newObjectMetadataItemId: string) => {
    if (currentObjectMetadataItemId === newObjectMetadataItemId) {
      closeDropdown();
      return;
    }

    if (isDefined(widgetInEditMode)) {
      removeDraftViewForRecordTableWidget(widgetInEditMode.id);
    }

    updateCurrentWidgetConfig({
      objectMetadataId: newObjectMetadataItemId,
      configToUpdate: {
        viewId: undefined,
      },
    });

    const selectedObjectMetadataItem = objectMetadataItems.find(
      (item) => item.id === newObjectMetadataItemId,
    );

    if (isDefined(selectedObjectMetadataItem) && isDefined(widgetInEditMode)) {
      addDraftViewForRecordTableWidget(
        widgetInEditMode.id,
        selectedObjectMetadataItem,
      );

      updatePageLayoutWidget(widgetInEditMode.id, {
        title: selectedObjectMetadataItem.labelPlural,
      });
    }

    closeDropdown();
  };

  return (
    <ObjectSourceDropdownContent
      selectedObjectMetadataItemId={currentObjectMetadataItemId}
      onSelect={handleSelectSource}
    />
  );
};
