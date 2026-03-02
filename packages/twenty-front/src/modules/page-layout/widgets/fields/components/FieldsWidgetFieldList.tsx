import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
import { useIsRecordReadOnly } from '@/object-record/read-only/hooks/useIsRecordReadOnly';
import { recordFieldListHoverPositionComponentState } from '@/object-record/record-field-list/states/recordFieldListHoverPositionComponentState';
import { PropertyBoxSkeletonLoader } from '@/object-record/record-inline-cell/property-box/components/PropertyBoxSkeletonLoader';
import { useRecordShowContainerActions } from '@/object-record/record-show/hooks/useRecordShowContainerActions';
import { useRecordShowContainerData } from '@/object-record/record-show/hooks/useRecordShowContainerData';
import { FieldsWidgetFieldItem } from '@/page-layout/widgets/fields/components/FieldsWidgetFieldItem';
import { type FieldsWidgetGroupField } from '@/page-layout/widgets/fields/types/FieldsWidgetGroup';
import { useTargetRecord } from '@/ui/layout/contexts/useTargetRecord';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';

type FieldsWidgetFieldListProps = {
  fields: FieldsWidgetGroupField[];
  instanceId: string;
};

export const FieldsWidgetFieldList = ({
  fields,
  instanceId,
}: FieldsWidgetFieldListProps) => {
  const targetRecord = useTargetRecord();

  const { recordLoading, isPrefetchLoading } = useRecordShowContainerData({
    objectRecordId: targetRecord.id,
  });

  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular: targetRecord.targetObjectNameSingular,
  });

  const { objectPermissionsByObjectMetadataId } = useObjectPermissions();
  const { objectMetadataItems } = useObjectMetadataItems();

  const { useUpdateOneObjectRecordMutation } = useRecordShowContainerActions({
    objectNameSingular: targetRecord.targetObjectNameSingular,
  });

  const isRecordReadOnly = useIsRecordReadOnly({
    recordId: targetRecord.id,
    objectMetadataId: objectMetadataItem.id,
  });

  const setRecordFieldListHoverPosition = useSetAtomComponentState(
    recordFieldListHoverPositionComponentState,
    instanceId,
  );

  if (isPrefetchLoading) {
    return <PropertyBoxSkeletonLoader />;
  }

  return fields.map(({ fieldMetadataItem, globalIndex }) => (
    <FieldsWidgetFieldItem
      key={targetRecord.id + fieldMetadataItem.id}
      fieldMetadataItem={fieldMetadataItem}
      globalIndex={globalIndex}
      recordId={targetRecord.id}
      targetObjectNameSingular={targetRecord.targetObjectNameSingular}
      objectMetadataItem={objectMetadataItem}
      objectMetadataItems={objectMetadataItems}
      objectPermissionsByObjectMetadataId={objectPermissionsByObjectMetadataId}
      isRecordReadOnly={isRecordReadOnly}
      useUpdateRecord={useUpdateOneObjectRecordMutation}
      recordLoading={recordLoading}
      instanceId={instanceId}
      onMouseEnter={() => setRecordFieldListHoverPosition(globalIndex)}
    />
  ));
};
