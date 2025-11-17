import { useDeleteOneObjectMetadataItem } from '@/object-metadata/hooks/useDeleteOneObjectMetadataItem';
import { useUpdateOneObjectMetadataItem } from '@/object-metadata/hooks/useUpdateOneObjectMetadataItem';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { useCombinedGetTotalCount } from '@/object-record/multiple-objects/hooks/useCombinedGetTotalCount';
import {
  SettingsObjectMetadataItemTableRow,
  StyledObjectTableRow,
} from '@/settings/data-model/object-details/components/SettingsObjectItemTableRow';
import { SettingsObjectInactiveMenuDropDown } from '@/settings/data-model/objects/components/SettingsObjectInactiveMenuDropDown';
import { getItemTagInfo } from '@/settings/data-model/utils/getItemTagInfo';
import { SettingsTextInput } from '@/ui/input/components/SettingsTextInput';
import { SortableTableHeader } from '@/ui/layout/table/components/SortableTableHeader';
import { Table } from '@/ui/layout/table/components/Table';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableSection } from '@/ui/layout/table/components/TableSection';
import { useSortedArray } from '@/ui/layout/table/hooks/useSortedArray';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyArray } from '@sniptt/guards';
import { useMemo, useState } from 'react';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import { IconChevronRight, IconSearch } from 'twenty-ui/display';
import { GET_SETTINGS_OBJECT_TABLE_METADATA } from '~/pages/settings/data-model/constants/SettingsObjectTableMetadata';
import type { SettingsObjectTableItem } from '~/pages/settings/data-model/types/SettingsObjectTableItem';
import { normalizeSearchText } from '~/utils/normalizeSearchText';

const StyledIconChevronRight = styled(IconChevronRight)`
  color: ${({ theme }) => theme.font.color.tertiary};
`;

const StyledSearchInput = styled(SettingsTextInput)`
  padding-bottom: ${({ theme }) => theme.spacing(2)};
  width: 100%;
`;

export const SettingsObjectTable = ({
  activeObjects,
  inactiveObjects,
  withSearchBar = true,
}: {
  activeObjects: ObjectMetadataItem[];
  inactiveObjects: ObjectMetadataItem[];
  withSearchBar?: boolean;
}) => {
  const { t } = useLingui();

  const theme = useTheme();

  const [searchTerm, setSearchTerm] = useState('');

  const { deleteOneObjectMetadataItem } = useDeleteOneObjectMetadataItem();

  const { updateOneObjectMetadataItem } = useUpdateOneObjectMetadataItem();

  const { totalCountByObjectMetadataItemNamePlural } = useCombinedGetTotalCount(
    {
      objectMetadataItems: [...activeObjects, ...inactiveObjects],
    },
  );

  const activeObjectSettingsArray = useMemo(
    () =>
      activeObjects.map(
        (objectMetadataItem) =>
          ({
            objectMetadataItem,
            labelPlural: objectMetadataItem.labelPlural,
            objectTypeLabel: getItemTagInfo(objectMetadataItem).labelText,
            fieldsCount: objectMetadataItem.fields.filter(
              (field) => !field.isSystem,
            ).length,
            totalObjectCount:
              totalCountByObjectMetadataItemNamePlural[
                objectMetadataItem.namePlural
              ] ?? 0,
          }) satisfies SettingsObjectTableItem,
      ),
    [activeObjects, totalCountByObjectMetadataItemNamePlural],
  );

  const inactiveObjectSettingsArray = useMemo(
    () =>
      inactiveObjects.map(
        (objectMetadataItem) =>
          ({
            objectMetadataItem,
            labelPlural: objectMetadataItem.labelPlural,
            objectTypeLabel: getItemTagInfo({
              isCustom: objectMetadataItem.isCustom,
              isRemote: objectMetadataItem.isRemote,
            }).labelText,
            fieldsCount: objectMetadataItem.fields.filter(
              (field) => !field.isSystem,
            ).length,
            totalObjectCount:
              totalCountByObjectMetadataItemNamePlural[
                objectMetadataItem.namePlural
              ] ?? 0,
          }) satisfies SettingsObjectTableItem,
      ),
    [inactiveObjects, totalCountByObjectMetadataItemNamePlural],
  );

  const sortedActiveObjectSettingsItems = useSortedArray(
    activeObjectSettingsArray,
    GET_SETTINGS_OBJECT_TABLE_METADATA,
  );

  const sortedInactiveObjectSettingsItems = useSortedArray(
    inactiveObjectSettingsArray,
    GET_SETTINGS_OBJECT_TABLE_METADATA,
  );

  const filteredActiveObjectSettingsItems = useMemo(
    () =>
      sortedActiveObjectSettingsItems.filter((item) => {
        const searchNormalized = normalizeSearchText(searchTerm);
        return (
          normalizeSearchText(item.labelPlural).includes(searchNormalized) ||
          normalizeSearchText(item.objectTypeLabel).includes(searchNormalized)
        );
      }),
    [sortedActiveObjectSettingsItems, searchTerm],
  );

  const filteredInactiveObjectSettingsItems = useMemo(
    () =>
      sortedInactiveObjectSettingsItems.filter((item) => {
        const searchNormalized = normalizeSearchText(searchTerm);
        return (
          normalizeSearchText(item.labelPlural).includes(searchNormalized) ||
          normalizeSearchText(item.objectTypeLabel).includes(searchNormalized)
        );
      }),
    [sortedInactiveObjectSettingsItems, searchTerm],
  );

  return (
    <>
      {withSearchBar && (
        <StyledSearchInput
          instanceId="settings-objects-search"
          LeftIcon={IconSearch}
          placeholder={t`Search for an object...`}
          value={searchTerm}
          onChange={setSearchTerm}
        />
      )}

      <Table>
        <StyledObjectTableRow>
          {GET_SETTINGS_OBJECT_TABLE_METADATA.fields.map(
            (settingsObjectsTableMetadataField) => (
              <SortableTableHeader
                key={settingsObjectsTableMetadataField.fieldName}
                fieldName={settingsObjectsTableMetadataField.fieldName}
                label={t(settingsObjectsTableMetadataField.fieldLabel)}
                tableId={GET_SETTINGS_OBJECT_TABLE_METADATA.tableId}
                align={settingsObjectsTableMetadataField.align}
                initialSort={GET_SETTINGS_OBJECT_TABLE_METADATA.initialSort}
              />
            ),
          )}
          <TableHeader></TableHeader>
        </StyledObjectTableRow>
        {isNonEmptyArray(sortedActiveObjectSettingsItems) && (
          <TableSection title={t`Active`}>
            {filteredActiveObjectSettingsItems.map((objectSettingsItem) => (
              <SettingsObjectMetadataItemTableRow
                key={objectSettingsItem.objectMetadataItem.namePlural}
                objectMetadataItem={objectSettingsItem.objectMetadataItem}
                totalObjectCount={objectSettingsItem.totalObjectCount}
                action={
                  <StyledIconChevronRight
                    size={theme.icon.size.md}
                    stroke={theme.icon.stroke.sm}
                  />
                }
                link={getSettingsPath(SettingsPath.ObjectDetail, {
                  objectNamePlural:
                    objectSettingsItem.objectMetadataItem.namePlural,
                })}
              />
            ))}
          </TableSection>
        )}
        {isNonEmptyArray(sortedInactiveObjectSettingsItems) && (
          <TableSection title={t`Inactive`}>
            {filteredInactiveObjectSettingsItems.map((objectSettingsItem) => (
              <SettingsObjectMetadataItemTableRow
                key={objectSettingsItem.objectMetadataItem.namePlural}
                objectMetadataItem={objectSettingsItem.objectMetadataItem}
                totalObjectCount={objectSettingsItem.totalObjectCount}
                action={
                  <SettingsObjectInactiveMenuDropDown
                    isCustomObject={
                      objectSettingsItem.objectMetadataItem.isCustom
                    }
                    objectMetadataItemNamePlural={
                      objectSettingsItem.objectMetadataItem.namePlural
                    }
                    onActivate={() =>
                      updateOneObjectMetadataItem({
                        idToUpdate: objectSettingsItem.objectMetadataItem.id,
                        updatePayload: { isActive: true },
                      })
                    }
                    onDelete={() =>
                      deleteOneObjectMetadataItem(
                        objectSettingsItem.objectMetadataItem.id,
                      )
                    }
                  />
                }
              />
            ))}
          </TableSection>
        )}
      </Table>
    </>
  );
};
