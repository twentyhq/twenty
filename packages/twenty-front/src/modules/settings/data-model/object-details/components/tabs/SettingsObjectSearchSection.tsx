import { useUpdateOneFieldMetadataItem } from '@/object-metadata/hooks/useUpdateOneFieldMetadataItem';
import { useUpdateOneObjectMetadataItem } from '@/object-metadata/hooks/useUpdateOneObjectMetadataItem';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { SEARCH_VECTOR_FIELD_NAME } from '@/object-record/constants/SearchVectorFieldName';
import { SettingsOptionCardContentToggle } from '@/settings/components/SettingsOptions/SettingsOptionCardContentToggle';
import { SettingsObjectFieldDataType } from '@/settings/data-model/object-details/components/SettingsObjectFieldDataType';
import { canBeSearchable } from '@/settings/data-model/fields/forms/utils/canBeSearchable';
import { type SettingsFieldType } from '@/settings/data-model/types/SettingsFieldType';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { SettingsTextInput } from '@/ui/input/components/SettingsTextInput';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { Table } from '@/ui/layout/table/components/Table';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useContext, useMemo, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { FeatureFlagKey } from '~/generated-metadata/graphql';

import {
  IconEye,
  IconPlus,
  IconSearch,
  IconTrash,
  useIcons,
} from 'twenty-ui/icon';
import { Button, LightIconButton } from 'twenty-ui/input';
import { MenuItem } from 'twenty-ui/navigation';
import { Card } from 'twenty-ui/surfaces';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';

type SettingsObjectSearchSectionProps = {
  objectMetadataItem: EnrichedObjectMetadataItem;
  isReadOnly: boolean;
};

type IndexedFieldEntry = {
  id: string;
  label: string;
  icon?: string | null;
  fieldType: string;
  isLabelIdentifier: boolean;
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

const StyledButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
`;

const INDEXED_FIELDS_GRID_TEMPLATE_COLUMNS = 'minmax(0, 1fr) 148px 40px';

const ADD_SEARCH_FIELD_DROPDOWN_ID = 'settings-object-add-search-field';

const extractIndexedFields = (
  objectMetadataItem: EnrichedObjectMetadataItem,
): IndexedFieldEntry[] => {
  const fieldById = new Map(
    objectMetadataItem.fields.map((field) => [field.id, field]),
  );

  return [...objectMetadataItem.searchFieldMetadatas]
    .sort(
      (searchFieldMetadataA, searchFieldMetadataB) =>
        searchFieldMetadataA.position - searchFieldMetadataB.position,
    )
    .map((searchFieldMetadata) => {
      const field = fieldById.get(searchFieldMetadata.fieldMetadataId);

      if (!isDefined(field) || field.name === SEARCH_VECTOR_FIELD_NAME) {
        return undefined;
      }

      return {
        id: field.id,
        label: field.label,
        icon: field.icon,
        fieldType: field.type,
        isLabelIdentifier:
          objectMetadataItem.labelIdentifierFieldMetadataId === field.id,
      } satisfies IndexedFieldEntry;
    })
    .filter(isDefined);
};

export const SettingsObjectSearchSection = ({
  objectMetadataItem,
  isReadOnly,
}: SettingsObjectSearchSectionProps) => {
  const { t } = useLingui();
  const { getIcon } = useIcons();
  const { theme } = useContext(ThemeContext);
  const { updateOneObjectMetadataItem } = useUpdateOneObjectMetadataItem();
  const { updateOneFieldMetadataItem } = useUpdateOneFieldMetadataItem();
  const { closeDropdown } = useCloseDropdown();
  const { enqueueSuccessSnackBar } = useSnackBar();

  const isConfigurableSearchFieldsEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_CONFIGURABLE_SEARCH_FIELDS_ENABLED,
  );

  const [isSearchable, setIsSearchable] = useState(
    objectMetadataItem.isSearchable,
  );
  const [searchTerm, setSearchTerm] = useState('');

  const indexedFields = useMemo(
    () => extractIndexedFields(objectMetadataItem),
    [objectMetadataItem],
  );

  const isEditable =
    isConfigurableSearchFieldsEnabled && !isReadOnly && isSearchable;

  const indexedFieldIds = useMemo(
    () => new Set(indexedFields.map((entry) => entry.id)),
    [indexedFields],
  );

  const addableFields = useMemo(
    () =>
      objectMetadataItem.fields.filter(
        (field) =>
          field.isActive === true &&
          !indexedFieldIds.has(field.id) &&
          canBeSearchable(field),
      ),
    [objectMetadataItem.fields, indexedFieldIds],
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

  const handleSetFieldSearchable = async (
    fieldMetadataId: string,
    value: boolean,
  ) => {
    const result = await updateOneFieldMetadataItem({
      objectMetadataId: objectMetadataItem.id,
      fieldMetadataIdToUpdate: fieldMetadataId,
      updatePayload: { isSearchable: value },
    });

    if (result.status === 'successful') {
      enqueueSuccessSnackBar({
        message: value
          ? t`Field added to search`
          : t`Field removed from search`,
      });
    }
  };

  return (
    <StyledSearchSectionContent>
      {!isReadOnly && (
        <Card rounded>
          <SettingsOptionCardContentToggle
            Icon={IconEye}
            title={t`Global search`}
            description={t`Show this object's records in the command menu (⌘K).`}
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
              <TableHeader>{t`Data type`}</TableHeader>
              <TableHeader></TableHeader>
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
                  <TableCell>
                    <SettingsObjectFieldDataType
                      value={entry.fieldType as SettingsFieldType}
                    />
                  </TableCell>
                  <TableCell align="right">
                    {isEditable && !entry.isLabelIdentifier && (
                      <LightIconButton
                        Icon={IconTrash}
                        accent="tertiary"
                        onClick={() =>
                          handleSetFieldSearchable(entry.id, false)
                        }
                      />
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </Table>
        </>
      )}
      {isEditable && (
        <StyledButtonContainer>
          <Dropdown
            dropdownId={ADD_SEARCH_FIELD_DROPDOWN_ID}
            dropdownPlacement="bottom-end"
            dropdownOffset={{ x: 0, y: 8 }}
            clickableComponent={
              <Button
                Icon={IconPlus}
                title={t`Add field`}
                size="small"
                variant="secondary"
                disabled={addableFields.length === 0}
              />
            }
            dropdownComponents={
              <DropdownContent>
                <DropdownMenuItemsContainer hasMaxHeight>
                  {addableFields.map((field) => {
                    const FieldIcon = getIcon(field.icon);

                    return (
                      <MenuItem
                        key={field.id}
                        LeftIcon={FieldIcon}
                        text={field.label}
                        onClick={() => {
                          closeDropdown(ADD_SEARCH_FIELD_DROPDOWN_ID);
                          handleSetFieldSearchable(field.id, true);
                        }}
                      />
                    );
                  })}
                </DropdownMenuItemsContainer>
              </DropdownContent>
            }
          />
        </StyledButtonContainer>
      )}
    </StyledSearchSectionContent>
  );
};
