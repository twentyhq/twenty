import { useGetIsMetadataItemFromStandardApplication } from '@/object-metadata/hooks/useGetIsMetadataItemFromStandardApplication';
import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
import { useIsRecordReadOnly } from '@/object-record/read-only/hooks/useIsRecordReadOnly';
import { isRecordFieldReadOnly } from '@/object-record/read-only/utils/isRecordFieldReadOnly';
import { isFieldRelation } from '@/object-record/record-field/ui/types/guards/isFieldRelation';
import { hasJunctionConfig } from '@/object-record/record-field/ui/utils/junction/hasJunctionConfig';
import { useIsPageLayoutInEditMode } from '@/page-layout/hooks/useIsPageLayoutInEditMode';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { useFieldWidgetFieldDefinition } from '@/page-layout/widgets/field/hooks/useFieldWidgetFieldDefinition';
import { isFieldWidget } from '@/page-layout/widgets/field/utils/isFieldWidget';
import { getObjectPermissionsFromMapByObjectMetadataId } from '@/settings/roles/role-permissions/objects-permissions/utils/getObjectPermissionsFromMapByObjectMetadataId';
import { useTargetRecord } from '@/ui/layout/contexts/useTargetRecord';
import { isDefined } from 'twenty-shared/utils';
import { RelationType } from '~/generated-metadata/graphql';

type UseFieldWidgetActionVisibilityParams = {
  widget: PageLayoutWidget;
};

export const useFieldWidgetActionVisibility = ({
  widget,
}: UseFieldWidgetActionVisibilityParams) => {
  const targetRecord = useTargetRecord();
  const isPageLayoutInEditMode = useIsPageLayoutInEditMode();

  const { objectMetadataItem, fieldMetadataItem, fieldDefinition } =
    useFieldWidgetFieldDefinition(widget);

  const { objectPermissionsByObjectMetadataId } = useObjectPermissions();
  const getIsMetadataItemFromStandardApplication =
    useGetIsMetadataItemFromStandardApplication();

  const isRecordReadOnly = useIsRecordReadOnly({
    recordId: targetRecord.id,
    objectMetadataId: objectMetadataItem.id,
  });

  if (
    !isFieldWidget(widget) ||
    !isDefined(fieldMetadataItem) ||
    !fieldMetadataItem.isActive ||
    !isDefined(fieldDefinition)
  ) {
    return { showSeeAll: false, showEdit: false };
  }

  const relationMetadata = isFieldRelation(fieldDefinition)
    ? fieldDefinition.metadata
    : null;

  const isOneToManyRelation =
    relationMetadata?.relationType === RelationType.ONE_TO_MANY;

  // "See all" links to the relation field's own index, which lists the first
  // hop. A nested widget lists the second hop, so the link would point at a
  // different object than the widget shows.
  const isNestedRelationWidget = isDefined(
    widget.configuration.nestedRelationFieldMetadataId,
  );

  const isJunctionRelation = hasJunctionConfig(relationMetadata?.settings);

  const showSeeAll =
    isOneToManyRelation && !isNestedRelationWidget && !isJunctionRelation;

  const isFieldReadOnly = isRecordFieldReadOnly({
    isRecordReadOnly,
    isSystemObject: objectMetadataItem.isSystem,
    objectPermissions: getObjectPermissionsFromMapByObjectMetadataId({
      objectPermissionsByObjectMetadataId,
      objectMetadataId: objectMetadataItem.id,
    }),
    isFieldFromStandardApplication:
      getIsMetadataItemFromStandardApplication(fieldMetadataItem),
    fieldMetadataItem: {
      id: fieldMetadataItem.id,
      isUIEditable: fieldMetadataItem.isUIEditable ?? true,
    },
    fieldDefinition,
    objectPermissionsByObjectMetadataId,
  });

  // The read-only chain already hides edit during layout customization
  // (useIsRecordReadOnly returns true then); the explicit check states the
  // rule here instead of leaving it implicit.
  const showEdit = !isPageLayoutInEditMode && !isFieldReadOnly;

  return { showSeeAll, showEdit };
};
