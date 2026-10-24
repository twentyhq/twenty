import { getFieldMetadataItemGqlFieldName } from '@/object-metadata/utils/getFieldMetadataItemGqlFieldName';
import { useObjectPermissionsForObject } from '@/object-record/hooks/useObjectPermissionsForObject';
import { hasAnySoftDeleteFilterOnViewComponentSelector } from '@/object-record/record-filter/states/hasAnySoftDeleteFilterOnView';
import { useCurrentRecordGroupDefinition } from '@/object-record/record-group/hooks/useCurrentRecordGroupDefinition';
import { recordIndexGroupFieldMetadataItemComponentState } from '@/object-record/record-index/states/recordIndexGroupFieldMetadataComponentState';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { useCreateNewIndexRecord } from '@/object-record/record-table/hooks/useCreateNewIndexRecord';
import { canCreateRecordsForObjectMetadataItem } from '@/object-record/utils/canCreateRecordsForObjectMetadataItem';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';
import { useToast } from 'twenty-ui/components/feedback';
import { LightButton } from 'twenty-ui/components/input';
import { IconPlus } from 'twenty-ui/icon';
import { logError } from '~/utils/logError';

export const RecordListAddNew = () => {
  const { objectMetadataItem } = useRecordIndexContextOrThrow();
  const { enqueueToast } = useToast();

  const { createNewIndexRecord } = useCreateNewIndexRecord({
    objectMetadataItem,
  });

  const currentRecordGroupDefinition = useCurrentRecordGroupDefinition();

  const recordIndexGroupFieldMetadataItem = useAtomComponentStateValue(
    recordIndexGroupFieldMetadataItemComponentState,
  );

  const groupFieldMetadataItem = objectMetadataItem.fields.find(
    (field) => field.id === recordIndexGroupFieldMetadataItem?.id,
  );

  const objectPermissions = useObjectPermissionsForObject(
    objectMetadataItem.id,
  );

  const hasAnySoftDeleteFilterOnView = useAtomComponentSelectorValue(
    hasAnySoftDeleteFilterOnViewComponentSelector,
  );

  if (hasAnySoftDeleteFilterOnView) {
    return null;
  }

  if (
    !canCreateRecordsForObjectMetadataItem({
      objectPermissions,
      objectMetadataItem,
    })
  ) {
    return null;
  }

  const handleCreateRecord = async () => {
    try {
      const groupFieldValues =
        isDefined(currentRecordGroupDefinition) &&
        isDefined(groupFieldMetadataItem)
          ? {
              [getFieldMetadataItemGqlFieldName(groupFieldMetadataItem)]:
                currentRecordGroupDefinition.value,
            }
          : {};

      await createNewIndexRecord({
        position: 'last',
        ...groupFieldValues,
      });
    } catch (error) {
      logError(error);
      enqueueToast({ status: 'error', children: t`Failed to create record` });
    }
  };

  return (
    <LightButton
      emphasis="subtle"
      size="sm"
      startIcon={<IconPlus />}
      type="button"
      onClick={handleCreateRecord}
    >
      {t`Add new`}
    </LightButton>
  );
};
