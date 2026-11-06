import { SettingsObjectFieldDataType } from '@/settings/data-model/object-details/components/SettingsObjectFieldDataType';
import { type SettingsFieldType } from '@/settings/data-model/types/SettingsFieldType';
import { type SettingsObjectSearchFieldsTableItem } from '@/settings/data-model/types/SettingsObjectSearchFieldsTableItem';
import { Table } from '@/ui/layout/table/components/Table';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { LightIconButton } from 'twenty-ui/components/input';
import { IconTrash } from 'twenty-ui/icon';
import { useIcons } from 'twenty-ui/icon/provider';
import { useTheme } from 'twenty-ui/theme';

const SEARCH_FIELDS_GRID_TEMPLATE_COLUMNS = 'minmax(0, 1fr) 148px 40px';

const StyledNameLabel = styled.div`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

type SettingsObjectSearchFieldsTableProps = {
  items: SettingsObjectSearchFieldsTableItem[];
  isEditable: boolean;
  onRemoveField: (fieldMetadataId: string) => void;
};

export const SettingsObjectSearchFieldsTable = ({
  items,
  isEditable,
  onRemoveField,
}: SettingsObjectSearchFieldsTableProps) => {
  const { t } = useLingui();
  const { getIcon } = useIcons();
  const theme = useTheme();

  return (
    <Table>
      <TableRow gridTemplateColumns={SEARCH_FIELDS_GRID_TEMPLATE_COLUMNS}>
        <TableHeader>{t`Name`}</TableHeader>
        <TableHeader>{t`Data type`}</TableHeader>
        <TableHeader></TableHeader>
      </TableRow>
      {items.map((item) => {
        const FieldIcon = getIcon(item.icon);

        return (
          <TableRow
            key={item.id}
            gridTemplateColumns={SEARCH_FIELDS_GRID_TEMPLATE_COLUMNS}
          >
            <TableCell color={theme.font.color.primary} gap={theme.spacing[2]}>
              <FieldIcon
                size={theme.icon.size.md}
                stroke={theme.icon.stroke.sm}
              />
              <StyledNameLabel>{item.label}</StyledNameLabel>
            </TableCell>
            <TableCell>
              <SettingsObjectFieldDataType
                value={item.fieldType as SettingsFieldType}
              />
            </TableCell>
            <TableCell align="right">
              {isEditable && !item.isLabelIdentifier && (
                <LightIconButton
                  emphasis="subtle"
                  onClick={() => onRemoveField(item.id)}
                  aria-label={t`Remove searchable field`}
                >
                  <IconTrash />
                </LightIconButton>
              )}
            </TableCell>
          </TableRow>
        );
      })}
    </Table>
  );
};
