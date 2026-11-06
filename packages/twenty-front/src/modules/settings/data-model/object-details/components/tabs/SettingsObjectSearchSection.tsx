import { formatShortcut } from 'twenty-ui/primitives/typography';
import { useUpdateOneFieldMetadataItem } from '@/object-metadata/hooks/useUpdateOneFieldMetadataItem';
import { useUpdateOneObjectMetadataItem } from '@/object-metadata/hooks/useUpdateOneObjectMetadataItem';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { SEARCH_VECTOR_FIELD_NAME } from '@/object-record/constants/SearchVectorFieldName';
import { SettingsOptionCardContentSwitch } from '@/settings/components/SettingsOptions/SettingsOptionCardContentSwitch';
import { canBeSearchable } from '@/settings/data-model/fields/forms/utils/canBeSearchable';
import { SettingsObjectSearchAddFieldDropdown } from '@/settings/data-model/object-details/components/SettingsObjectSearchAddFieldDropdown';
import { SettingsObjectSearchFieldsTable } from '@/settings/data-model/object-details/components/SettingsObjectSearchFieldsTable';
import { type SettingsObjectSearchFieldsTableItem } from '@/settings/data-model/types/SettingsObjectSearchFieldsTableItem';
import { SettingsTextInput } from '@/ui/input/components/SettingsTextInput';
import { TableFooter } from '@/ui/layout/table/components/TableFooter';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useMemo, useState } from 'react';
import { useToast } from 'twenty-ui/components/feedback';
import { IconEye, IconSearch } from 'twenty-ui/icon';
import { Card } from 'twenty-ui/primitives/surfaces';
import { themeCssVariables } from 'twenty-ui/theme';
import { FeatureFlagKey } from '~/generated-metadata/graphql';

type SettingsObjectSearchSectionProps = {
  objectMetadataItem: EnrichedObjectMetadataItem;
  isReadOnly: boolean;
};

const StyledSearchSectionContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[4]};
`;

const StyledTableContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const extractSearchFields = (
  objectMetadataItem: EnrichedObjectMetadataItem,
): SettingsObjectSearchFieldsTableItem[] => {
  const positionByFieldMetadataId = new Map(
    objectMetadataItem.searchFieldMetadatas.map((searchFieldMetadata) => [
      searchFieldMetadata.fieldMetadataId,
      searchFieldMetadata.position,
    ]),
  );

  return objectMetadataItem.fields
    .filter(
      (field) =>
        field.isSearchable === true && field.name !== SEARCH_VECTOR_FIELD_NAME,
    )
    .sort(
      (fieldA, fieldB) =>
        (positionByFieldMetadataId.get(fieldA.id) ?? Number.MAX_SAFE_INTEGER) -
        (positionByFieldMetadataId.get(fieldB.id) ?? Number.MAX_SAFE_INTEGER),
    )
    .map(
      (field) =>
        ({
          id: field.id,
          label: field.label,
          icon: field.icon,
          fieldType: field.type,
          isLabelIdentifier:
            objectMetadataItem.labelIdentifierFieldMetadataId === field.id,
        }) satisfies SettingsObjectSearchFieldsTableItem,
    );
};

export const SettingsObjectSearchSection = ({
  objectMetadataItem,
  isReadOnly,
}: SettingsObjectSearchSectionProps) => {
  const { t } = useLingui();
  const { updateOneObjectMetadataItem } = useUpdateOneObjectMetadataItem();
  const { updateOneFieldMetadataItem } = useUpdateOneFieldMetadataItem();
  const { enqueueToast } = useToast();

  const isConfigurableSearchFieldsEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_CONFIGURABLE_SEARCH_FIELDS_ENABLED,
  );

  const [isSearchable, setIsSearchable] = useState(
    objectMetadataItem.isSearchable,
  );
  const [searchTerm, setSearchTerm] = useState('');

  const searchFields = useMemo(
    () => extractSearchFields(objectMetadataItem),
    [objectMetadataItem],
  );

  const isEditable =
    isConfigurableSearchFieldsEnabled &&
    !isReadOnly &&
    objectMetadataItem.isSearchable;

  const hasSearchFields = searchFields.length > 0;

  const searchFieldIds = useMemo(
    () => new Set(searchFields.map((entry) => entry.id)),
    [searchFields],
  );

  const addableFields = useMemo(
    () =>
      objectMetadataItem.fields.filter(
        (field) =>
          field.isActive === true &&
          !searchFieldIds.has(field.id) &&
          canBeSearchable(field),
      ),
    [objectMetadataItem.fields, searchFieldIds],
  );

  const filteredSearchFields = searchTerm
    ? searchFields.filter((entry) =>
        entry.label.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    : searchFields;

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
      enqueueToast({
        status: 'success',
        children: value
          ? t`Field added to search`
          : t`Field removed from search`,
      });
    }
  };

  return (
    <StyledSearchSectionContent>
      {!isReadOnly && (
        <Card.Root>
          <SettingsOptionCardContentSwitch
            Icon={IconEye}
            title={t`Global search`}
            description={t`Show this object's records in the command menu (${formatShortcut({ shortcut: ['Mod', 'K'] })}).`}
            checked={isSearchable}
            onChange={handleToggleSearchable}
          />
        </Card.Root>
      )}
      {hasSearchFields && (
        <SettingsTextInput
          instanceId="search-fields-filter"
          LeftIcon={IconSearch}
          placeholder={t`Search fields...`}
          value={searchTerm}
          onChange={setSearchTerm}
        />
      )}
      {(hasSearchFields || isEditable) && (
        <StyledTableContainer>
          {hasSearchFields && (
            <SettingsObjectSearchFieldsTable
              items={filteredSearchFields}
              isEditable={isEditable}
              onRemoveField={(fieldMetadataId) =>
                handleSetFieldSearchable(fieldMetadataId, false)
              }
            />
          )}
          {isEditable && (
            <TableFooter>
              <SettingsObjectSearchAddFieldDropdown
                addableFields={addableFields}
                onAddField={(fieldMetadataId) =>
                  handleSetFieldSearchable(fieldMetadataId, true)
                }
              />
            </TableFooter>
          )}
        </StyledTableContainer>
      )}
    </StyledSearchSectionContent>
  );
};
