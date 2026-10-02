import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
import { useIsRecordReadOnly } from '@/object-record/read-only/hooks/useIsRecordReadOnly';
import { isRecordFieldReadOnly } from '@/object-record/read-only/utils/isRecordFieldReadOnly';
import { isFieldRelation } from '@/object-record/record-field/ui/types/guards/isFieldRelation';
import { isUsableJunctionConfig } from '@/object-record/record-field/ui/utils/junction/isUsableJunctionConfig';
import { resolveJunctionConfig } from '@/object-record/record-field/ui/utils/junction/resolveJunctionConfig';
import { useIsPageLayoutInEditMode } from '@/page-layout/hooks/useIsPageLayoutInEditMode';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { useFieldWidgetFieldDefinition } from '@/page-layout/widgets/field/hooks/useFieldWidgetFieldDefinition';
import { isFieldWidget } from '@/page-layout/widgets/field/utils/isFieldWidget';
import { getObjectPermissionsForObject } from '@/object-metadata/utils/getObjectPermissionsForObject';
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
  const { objectMetadataItems } = useObjectMetadataItems();

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

  // "See all" opens the first hop's index, but a nested widget lists the second hop.
  const isNestedRelationWidget = isDefined(
    widget.configuration.nestedRelationFieldMetadataId,
  );

  const junctionConfig = isDefined(relationMetadata)
    ? resolveJunctionConfig({
        settings: relationMetadata.settings,
        relationObjectMetadataId: relationMetadata.relationObjectMetadataId,
        relationTargetFieldMetadataId: relationMetadata.relationFieldMetadataId,
        sourceObjectMetadataId: objectMetadataItem.id,
        objectMetadataItems,
      })
    : null;
  const isJunctionRelation = isDefined(junctionConfig);

  const showSeeAll =
    isOneToManyRelation && !isNestedRelationWidget && !isJunctionRelation;

  const isFieldReadOnly = isRecordFieldReadOnly({
    isRecordReadOnly,
    objectPermissions: getObjectPermissionsForObject(
      objectPermissionsByObjectMetadataId,
      objectMetadataItem.id,
    ),
    fieldMetadataItem,
    fieldDefinition,
    objectPermissionsByObjectMetadataId,
  });

  const showEdit =
    !isPageLayoutInEditMode &&
    !isFieldReadOnly &&
    (!isDefined(junctionConfig) || isUsableJunctionConfig(junctionConfig));

  return { showSeeAll, showEdit };
};
