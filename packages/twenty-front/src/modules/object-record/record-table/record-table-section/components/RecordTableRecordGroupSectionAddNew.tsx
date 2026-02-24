import { useObjectPermissionsForObject } from '@/object-record/hooks/useObjectPermissionsForObject';
import { useCurrentRecordGroupId } from '@/object-record/record-group/hooks/useCurrentRecordGroupId';
import { recordGroupDefinitionFamilyState } from '@/object-record/record-group/states/recordGroupDefinitionFamilyState';
import { recordIndexGroupFieldMetadataItemComponentState } from '@/object-record/record-index/states/recordIndexGroupFieldMetadataComponentState';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { useCreateNewIndexRecord } from '@/object-record/record-table/hooks/useCreateNewIndexRecord';
import { RecordTableActionRow } from '@/object-record/record-table/record-table-row/components/RecordTableActionRow';
import { useFamilyRecoilValueV2 } from '@/ui/utilities/state/jotai/hooks/useFamilyRecoilValueV2';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentValueV2';
import { t } from '@lingui/core/macro';
import { IconPlus } from 'twenty-ui/display';

export const RecordTableRecordGroupSectionAddNew = () => {
  const { objectMetadataItem } = useRecordTableContextOrThrow();

  const currentRecordGroupId = useCurrentRecordGroupId();

  const recordGroup = useFamilyRecoilValueV2(
    recordGroupDefinitionFamilyState,
    currentRecordGroupId,
  );

  const mainGroupByFieldMetadata = useRecoilComponentValueV2(
    recordIndexGroupFieldMetadataItemComponentState,
  );

  const { createNewIndexRecord } = useCreateNewIndexRecord({
    objectMetadataItem,
  });

  const fieldMetadataItem = objectMetadataItem.fields.find(
    (field) => field.id === mainGroupByFieldMetadata?.id,
  );

  const objectPermissions = useObjectPermissionsForObject(
    objectMetadataItem.id,
  );

  const hasObjectUpdatePermissions = objectPermissions.canUpdateObjectRecords;

  if (!hasObjectUpdatePermissions) {
    return null;
  }

  return (
    <RecordTableActionRow
      LeftIcon={IconPlus}
      text={t`Add new`}
      onClick={() => {
        if (!fieldMetadataItem) {
          return;
        }

        createNewIndexRecord({
          position: 'last',
          [fieldMetadataItem.name]: recordGroup?.value,
        });
      }}
    />
  );
};
