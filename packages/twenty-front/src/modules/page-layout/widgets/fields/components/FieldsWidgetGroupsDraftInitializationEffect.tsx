import { useContextStoreObjectMetadataItemOrThrow } from '@/context-store/hooks/useContextStoreObjectMetadataItemOrThrow';
import { useFieldsWidgetEditorGroupsData } from '@/page-layout/widgets/fields/hooks/useFieldsWidgetEditorGroupsData';
import { useInitializeFieldsWidgetGroupsDraft } from '@/page-layout/widgets/fields/hooks/useInitializeFieldsWidgetGroupsDraft';

type FieldsWidgetGroupsDraftInitializationEffectProps = {
  viewId: string | null;
  pageLayoutId: string;
  widgetId: string;
};

export const FieldsWidgetGroupsDraftInitializationEffect = ({
  viewId,
  pageLayoutId,
  widgetId,
}: FieldsWidgetGroupsDraftInitializationEffectProps) => {
  const { objectMetadataItem } = useContextStoreObjectMetadataItemOrThrow();

  const {
    groups: persistedGroups,
    ungroupedFields,
    editorMode,
  } = useFieldsWidgetEditorGroupsData({
    viewId,
    objectNameSingular: objectMetadataItem.nameSingular,
  });

  useInitializeFieldsWidgetGroupsDraft({
    pageLayoutId,
    widgetId,
    persistedGroups,
    persistedUngroupedFields: ungroupedFields,
    persistedEditorMode: editorMode,
  });

  return null;
};
