import { getFieldMetadataItemGqlFieldName } from '@/object-metadata/utils/getFieldMetadataItemGqlFieldName';
import { useObjectPermissionsForObject } from '@/object-record/hooks/useObjectPermissionsForObject';
import { hasAnySoftDeleteFilterOnViewComponentSelector } from '@/object-record/record-filter/states/hasAnySoftDeleteFilterOnView';
import { useCurrentRecordGroupDefinition } from '@/object-record/record-group/hooks/useCurrentRecordGroupDefinition';
import { recordIndexGroupFieldMetadataItemComponentState } from '@/object-record/record-index/states/recordIndexGroupFieldMetadataComponentState';
import { useRecordListContextOrThrow } from '@/object-record/record-list/contexts/RecordListContext';
import { useCreateNewIndexRecord } from '@/object-record/record-table/hooks/useCreateNewIndexRecord';
import { canCreateRecordsForObjectMetadataItem } from '@/object-record/utils/canCreateRecordsForObjectMetadataItem';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useContext } from 'react';
import { IconPlus } from 'twenty-ui/icon';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';
import { logError } from '~/utils/logError';

const StyledAddNewRow = styled.button`
  align-items: center;
  background: transparent;
  border: none;
  border-radius: ${themeCssVariables.border.radius.sm};
  color: ${themeCssVariables.font.color.tertiary};
  cursor: pointer;
  display: flex;
  font-size: ${themeCssVariables.font.size.md};
  gap: ${themeCssVariables.spacing[1]};
  height: 24px;
  padding: 0 6px;
  text-align: left;

  &:hover {
    background: ${themeCssVariables.background.transparent.lighter};
  }
`;

export const RecordListAddNew = () => {
  const { theme } = useContext(ThemeContext);
  const { objectMetadataItem } = useRecordListContextOrThrow();
  const { enqueueErrorSnackBar } = useSnackBar();

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
        currentRecordGroupDefinition !== undefined &&
        groupFieldMetadataItem !== undefined
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
      enqueueErrorSnackBar({ message: t`Failed to create record` });
    }
  };

  return (
    <StyledAddNewRow type="button" onClick={handleCreateRecord}>
      <IconPlus
        stroke={theme.icon.stroke.sm}
        size={theme.icon.size.sm}
        color={theme.font.color.tertiary}
      />
      {t`Add new`}
    </StyledAddNewRow>
  );
};
