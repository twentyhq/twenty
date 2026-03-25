import { useUpdateOneObjectMetadataItem } from '@/object-metadata/hooks/useUpdateOneObjectMetadataItem';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { SEARCH_VECTOR_FIELD_NAME } from '@/object-record/constants/SearchVectorFieldName';
import { SettingsOptionCardContentToggle } from '@/settings/components/SettingsOptions/SettingsOptionCardContentToggle';
import { SettingsObjectFieldDataType } from '@/settings/data-model/object-details/components/SettingsObjectFieldDataType';
import { type SettingsFieldType } from '@/settings/data-model/types/SettingsFieldType';
import { SettingsTextInput } from '@/ui/input/components/SettingsTextInput';
import { Table } from '@/ui/layout/table/components/Table';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useContext, useMemo, useState } from 'react';

import { IconEye, IconSearch, useIcons } from 'twenty-ui/display';
import { Card } from 'twenty-ui/layout';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';

type SettingsObjectSearchSectionProps = {
  objectMetadataItem: EnrichedObjectMetadataItem;
  isReadOnly: boolean;
};

type IndexedFieldEntry = {
  id: string;
  label: string;
  icon?: string | null;
  weight: number;
  fieldType: string;
};

const StyledSearchSectionContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[4]};
`;

const StyledNameLabel = styled.div`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const INDEXED_FIELDS_GRID_TEMPLATE_COLUMNS = 'minmax(0, 1fr) 100px 148px';

// TODO: This is very DIRTY ; let's migrate searchVector to be proper tables
// Already tracked here: https://github.com/twentyhq/core-team-issues/issues/1428
const extractIndexedFields = (
  objectMetadataItem: EnrichedObjectMetadataItem,
): IndexedFieldEntry[] => {
  const searchVectorField = objectMetadataItem.fields.find(
    (field) => field.name === SEARCH_VECTOR_FIELD_NAME,
  );

  const asExpression = (
    searchVectorField?.settings as { asExpression?: string } | null
  )?.asExpression;

  if (!asExpression) {
    return [];
  }

  const columnNames = [
    ...new Set(
      Array.from(asExpression.matchAll(/"([^"]+)"/g), (match) => match[1]),
    ),
  ];

  const seenFieldIds = new Set<string>();
  const entries: IndexedFieldEntry[] = [];

  for (const columnName of columnNames) {
    const field = objectMetadataItem.fields.find(
      (fieldItem) =>
        fieldItem.name === columnName || columnName.startsWith(fieldItem.name),
    );

    if (
      field &&
      field.name !== SEARCH_VECTOR_FIELD_NAME &&
      !seenFieldIds.has(field.id)
    ) {
      seenFieldIds.add(field.id);

      entries.push({
        id: field.id,
        label: field.label,
        icon: field.icon,
        weight: 1,
        fieldType: field.type,
      });
    }
  }

  return entries;
};

export const SettingsObjectSearchSection = ({
  objectMetadataItem,
  isReadOnly,
}: SettingsObjectSearchSectionProps) => {
  const { t } = useLingui();
  const { getIcon } = useIcons();
  const { theme } = useContext(ThemeContext);
  const { updateOneObjectMetadataItem } = useUpdateOneObjectMetadataItem();

  const [isSearchable, setIsSearchable] = useState(
    objectMetadataItem.isSearchable,
  );
  const [searchTerm, setSearchTerm] = useState('');

  const indexedFields = useMemo(
    () => extractIndexedFields(objectMetadataItem),
    [objectMetadataItem],
  );

  const filteredIndexedFields = searchTerm
    ? indexedFields.filter((entry) =>
        entry.label.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    : indexedFields;

  const handleToggleSearchable = async (value: boolean) => {
    setIsSearchable(value);
    await updateOneObjectMetadataItem({
      idToUpdate: objectMetadataItem.id,
      updatePayload: { isSearchable: value },
    });
  };

  return (
    <StyledSearchSectionContent>
      {!isReadOnly && (
        <Card rounded>
          <SettingsOptionCardContentToggle
            Icon={IconEye}
            title={t`Include in default search`}
            description={t`If disabled, use advanced search filters to find these records`}
            checked={isSearchable}
            advancedMode
            onChange={handleToggleSearchable}
          />
        </Card>
      )}
      {indexedFields.length > 0 && (
        <>
          <SettingsTextInput
            instanceId="indexed-fields-search"
            LeftIcon={IconSearch}
            placeholder={t`Search across indexed fields...`}
            value={searchTerm}
            onChange={setSearchTerm}
          />
          <Table>
            <TableRow
              gridTemplateColumns={INDEXED_FIELDS_GRID_TEMPLATE_COLUMNS}
            >
              <TableHeader>{t`Name`}</TableHeader>
              <TableHeader>{t`Weight`}</TableHeader>
              <TableHeader>{t`Data type`}</TableHeader>
            </TableRow>
            {filteredIndexedFields.map((entry) => {
              const FieldIcon = getIcon(entry.icon);
              return (
                <TableRow
                  key={entry.id}
                  gridTemplateColumns={INDEXED_FIELDS_GRID_TEMPLATE_COLUMNS}
                >
                  <TableCell
                    color={theme.font.color.primary}
                    gap={theme.spacing[2]}
                  >
                    <FieldIcon
                      size={theme.icon.size.md}
                      stroke={theme.icon.stroke.sm}
                    />
                    <StyledNameLabel>{entry.label}</StyledNameLabel>
                  </TableCell>
                  <TableCell>{entry.weight}</TableCell>
                  <TableCell>
                    <SettingsObjectFieldDataType
                      value={entry.fieldType as SettingsFieldType}
                    />
                  </TableCell>
                </TableRow>
              );
            })}
          </Table>
        </>
      )}
    </StyledSearchSectionContent>
  );
};
