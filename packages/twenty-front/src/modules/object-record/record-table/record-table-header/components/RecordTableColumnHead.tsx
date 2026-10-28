import { styled } from '@linaria/react';
import { FieldDescriptionTooltip } from '@/object-record/record-field/ui/components/FieldDescriptionTooltip';

import { fieldMetadataItemByIdSelector } from '@/object-metadata/states/fieldMetadataItemByIdSelector';
import { type RecordField } from '@/object-record/record-field/types/RecordField';
import { RECORD_TABLE_CELL_CONTENT_CLASS_NAME } from '@/object-record/record-table/constants/RecordTableCellContentClassName';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { useIcons } from 'twenty-ui/icon';
import { useTheme, themeCssVariables } from 'twenty-ui/theme';

const StyledTitle = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.secondary};
  display: flex;
  flex-direction: row;
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.medium};
  gap: ${themeCssVariables.spacing[1.5]};
  height: ${themeCssVariables.spacing[8]};
  letter-spacing: 0.01em;
  padding-left: ${themeCssVariables.spacing[2]};
  padding-right: ${themeCssVariables.spacing[2]};
`;

const StyledIcon = styled.div`
  color: ${themeCssVariables.font.color.light};
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

  const { getIcon } = useIcons();
  const Icon = getIcon(
    correspondingFieldMetadataItem.foundFieldMetadataItem?.icon,
  );
  const fieldMetadataItem =
    correspondingFieldMetadataItem.foundFieldMetadataItem;

  return (
    <StyledTitle className={RECORD_TABLE_CELL_CONTENT_CLASS_NAME}>
      <StyledIcon>
        <Icon size={theme.icon.size.sm} />
      </StyledIcon>
      <FieldDescriptionTooltip
        label={fieldMetadataItem?.label}
        description={fieldMetadataItem?.description}
      />
    </StyledTitle>
  );
};
