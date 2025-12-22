import { useFieldMetadataItemById } from '@/object-metadata/hooks/useFieldMetadataItemById';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
import { useIsRecordReadOnly } from '@/object-record/read-only/hooks/useIsRecordReadOnly';
import { isRecordFieldReadOnly } from '@/object-record/read-only/utils/isRecordFieldReadOnly';
import { useResolveFieldMetadataIdFromNameOrId } from '@/page-layout/hooks/useResolveFieldMetadataIdFromNameOrId';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { isFieldWidget } from '@/page-layout/widgets/field/utils/isFieldWidget';
import { type WidgetAction } from '@/page-layout/widgets/types/WidgetAction';
import { getObjectPermissionsFromMapByObjectMetadataId } from '@/settings/roles/role-permissions/objects-permissions/utils/getObjectPermissionsFromMapByObjectMetadataId';
import { useTargetRecord } from '@/ui/layout/contexts/useTargetRecord';
import { isDefined } from 'twenty-shared/utils';

type UseWidgetActionsParams = {
  widget: PageLayoutWidget;
};

export const useWidgetActions = ({
  widget,
}: UseWidgetActionsParams): WidgetAction[] => {
  const targetRecord = useTargetRecord();

  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular: targetRecord.targetObjectNameSingular,
  });

  const fieldMetadataId = isFieldWidget(widget)
    ? widget.configuration.fieldMetadataId
    : undefined;

  const resolvedFieldMetadataId = useResolveFieldMetadataIdFromNameOrId(
    fieldMetadataId ?? '',
  );

  const { fieldMetadataItem } = useFieldMetadataItemById(
    resolvedFieldMetadataId ?? '',
  );

  const { objectPermissionsByObjectMetadataId } = useObjectPermissions();

  const isRecordReadOnly = useIsRecordReadOnly({
    recordId: targetRecord.id,
    objectMetadataId: objectMetadataItem.id,
  });

  const actions: WidgetAction[] = [];

  if (
    !isFieldWidget(widget) ||
    !isDefined(fieldMetadataItem) ||
    !fieldMetadataItem.isActive
  ) {
    return actions;
  }

  const isFieldReadOnly = isRecordFieldReadOnly({
    isRecordReadOnly,
    objectPermissions: getObjectPermissionsFromMapByObjectMetadataId({
      objectPermissionsByObjectMetadataId,
      objectMetadataId: objectMetadataItem.id,
    }),
    fieldMetadataItem: {
      id: fieldMetadataItem.id,
      isUIReadOnly: fieldMetadataItem.isUIReadOnly ?? false,
    },
  });

  if (!isFieldReadOnly) {
    actions.push({
      id: 'edit',
      position: 0,
    });
  }

  return actions.sort((a, b) => a.position - b.position);
};
