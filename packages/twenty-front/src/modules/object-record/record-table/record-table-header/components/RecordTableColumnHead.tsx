import { styled } from '@linaria/react';
import { FieldDescriptionTooltip } from '@/object-record/record-field/ui/components/FieldDescriptionTooltip';

import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { fieldMetadataItemByIdSelector } from '@/object-metadata/states/fieldMetadataItemByIdSelector';
import { findRecordFieldLookupTargetFieldMetadataItem } from '@/object-record/record-column-lookup/utils/findRecordFieldLookupTargetFieldMetadataItem';
import { getRecordFieldColumnLabel } from '@/object-record/record-column-lookup/utils/getRecordFieldColumnLabel';
import { type RecordField } from '@/object-record/record-field/types/RecordField';
import { RECORD_TABLE_CELL_CONTENT_CLASS_NAME } from '@/object-record/record-table/constants/RecordTableCellContentClassName';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { useIcons } from 'twenty-ui/icon/provider';
import { isDefined } from 'twenty-shared/utils';
import { useTheme, themeCssVariables } from 'twenty-ui/theme';

const StyledTitle = styled.div`
  align-items: center;
  display: flex;
  flex-direction: row;
  font-weight: ${themeCssVariables.font.weight.medium};
  gap: ${themeCssVariables.spacing[1]};
  height: ${themeCssVariables.spacing[8]};
  padding-left: ${themeCssVariables.spacing[2]};
  padding-right: ${themeCssVariables.spacing[2]};
`;

const StyledIcon = styled.div`
  display: flex;
  flex-shrink: 0;
`;

type RecordTableColumnHeadProps = {
  recordField: RecordField;
};

export const RecordTableColumnHead = ({
  recordField,
}: RecordTableColumnHeadProps) => {
  const theme = useTheme();

  const correspondingFieldMetadataItem = useAtomFamilySelectorValue(
    fieldMetadataItemByIdSelector,
    { fieldMetadataItemId: recordField.fieldMetadataItemId },
  );

  const { objectMetadataItems } = useObjectMetadataItems();
  const { getIcon } = useIcons();
  const fieldMetadataItem =
    correspondingFieldMetadataItem.foundFieldMetadataItem;

  const lookupTargetFieldMetadataItem = isDefined(fieldMetadataItem)
    ? findRecordFieldLookupTargetFieldMetadataItem({
        recordField,
        fieldMetadataItem,
        objectMetadataItems,
      })
    : undefined;

  const Icon = getIcon(
    lookupTargetFieldMetadataItem?.icon ?? fieldMetadataItem?.icon,
  );

  return (
    <StyledTitle className={RECORD_TABLE_CELL_CONTENT_CLASS_NAME}>
      <StyledIcon>
        <Icon size={theme.icon.size.md} />
      </StyledIcon>
      <FieldDescriptionTooltip
        label={getRecordFieldColumnLabel({
          recordField,
          fieldMetadataItem,
          lookupTargetFieldMetadataItem,
        })}
        description={
          lookupTargetFieldMetadataItem?.description ??
          fieldMetadataItem?.description
        }
      />
    </StyledTitle>
  );
};
