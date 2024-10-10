import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { H2Title, IconChevronRight, IconPlus, IconSearch } from 'twenty-ui';

import { useDeleteOneObjectMetadataItem } from '@/object-metadata/hooks/useDeleteOneObjectMetadataItem';
import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { useUpdateOneObjectMetadataItem } from '@/object-metadata/hooks/useUpdateOneObjectMetadataItem';
import { getObjectSlug } from '@/object-metadata/utils/getObjectSlug';
import { useCombinedGetTotalCount } from '@/object-record/multiple-objects/hooks/useCombinedGetTotalCount';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import {
  SettingsObjectMetadataItemTableRow,
  StyledObjectTableRow,
} from '@/settings/data-model/object-details/components/SettingsObjectItemTableRow';
import { SettingsObjectCoverImage } from '@/settings/data-model/objects/SettingsObjectCoverImage';
import { SettingsObjectInactiveMenuDropDown } from '@/settings/data-model/objects/SettingsObjectInactiveMenuDropDown';
import { getObjectTypeLabel } from '@/settings/data-model/utils/getObjectTypeLabel';
import { getSettingsPagePath } from '@/settings/utils/getSettingsPagePath';
import { SettingsPath } from '@/types/SettingsPath';
import { Button } from '@/ui/input/button/components/Button';
import { TextInput } from '@/ui/input/components/TextInput';
import { SubMenuTopBarContainer } from '@/ui/layout/page/SubMenuTopBarContainer';
import { Section } from '@/ui/layout/section/components/Section';
import { SortableTableHeader } from '@/ui/layout/table/components/SortableTableHeader';
import { Table } from '@/ui/layout/table/components/Table';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableSection } from '@/ui/layout/table/components/TableSection';
import { useSortedArray } from '@/ui/layout/table/hooks/useSortedArray';
import { UndecoratedLink } from '@/ui/navigation/link/components/UndecoratedLink';
import { isNonEmptyArray } from '@sniptt/guards';
import { useMemo, useState } from 'react';
import { SETTINGS_OBJECT_TABLE_METADATA } from '~/pages/settings/data-model/constants/SettingsObjectTableMetadata';
import { SettingsObjectTableItem } from '~/pages/settings/data-model/types/SettingsObjectTableItem';

const StyledIconChevronRight = styled(IconChevronRight)`
  color: ${({ theme }) => theme.font.color.tertiary};
`;
const StyledSearchInput = styled(TextInput)`
  padding-bottom: ${({ theme }) => theme.spacing(2)};
  width: 100%;
`;
export const SettingsObjects = () => {
  const theme = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const { deleteOneObjectMetadataItem } = useDeleteOneObjectMetadataItem();
  const { updateOneObjectMetadataItem } = useUpdateOneObjectMetadataItem();

  const { activeObjectMetadataItems, inactiveObjectMetadataItems } =
    useFilteredObjectMetadataItems();

  const { totalCountByObjectMetadataItemNamePlural } = useCombinedGetTotalCount(
    {
      objectMetadataItems: [
        ...activeObjectMetadataItems,
        ...inactiveObjectMetadataItems,
      ],
    },
  );

  const activeObjectSettingsArray = useMemo(
    () =>
      activeObjectMetadataItems.map(
        (objectMetadataItem) =>
          ({
            objectMetadataItem,
            labelPlural: objectMetadataItem.labelPlural,
            objectTypeLabel: getObjectTypeLabel(objectMetadataItem).labelText,
            fieldsCount: objectMetadataItem.fields.filter(
              (field) => !field.isSystem,
            ).length,
            totalObjectCount:
              totalCountByObjectMetadataItemNamePlural[
                objectMetadataItem.namePlural
              ] ?? 0,
          }) satisfies SettingsObjectTableItem,
      ),
    [activeObjectMetadataItems, totalCountByObjectMetadataItemNamePlural],
  );

  const inactiveObjectSettingsArray = useMemo(
    () =>
      inactiveObjectMetadataItems.map(
        (objectMetadataItem) =>
          ({
            objectMetadataItem,
            labelPlural: objectMetadataItem.labelPlural,
            objectTypeLabel: getObjectTypeLabel(objectMetadataItem).labelText,
            fieldsCount: objectMetadataItem.fields.filter(
              (field) => !field.isSystem,
            ).length,
            totalObjectCount:
              totalCountByObjectMetadataItemNamePlural[
                objectMetadataItem.namePlural
              ] ?? 0,
          }) satisfies SettingsObjectTableItem,
      ),
    [inactiveObjectMetadataItems, totalCountByObjectMetadataItemNamePlural],
  );

  const sortedActiveObjectSettingsItems = useSortedArray(
    activeObjectSettingsArray,
    SETTINGS_OBJECT_TABLE_METADATA,
  );

  const sortedInactiveObjectSettingsItems = useSortedArray(
    inactiveObjectSettingsArray,
    SETTINGS_OBJECT_TABLE_METADATA,
  );
  const filteredActiveObjectSettingsItems = useMemo(
    () =>
      sortedActiveObjectSettingsItems.filter(
        (item) =>
          item.labelPlural.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.objectTypeLabel.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
    [sortedActiveObjectSettingsItems, searchTerm],
  );

  const filteredInactiveObjectSettingsItems = useMemo(
    () =>
      sortedInactiveObjectSettingsItems.filter(
        (item) =>
          item.labelPlural.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.objectTypeLabel.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
    [sortedInactiveObjectSettingsItems, searchTerm],
  );
  return (
    <SubMenuTopBarContainer
      title="Data model"
      actionButton={
        <UndecoratedLink to={getSettingsPagePath(SettingsPath.NewObject)}>
          <Button
            Icon={IconPlus}
            title="Add object"
            accent="blue"
            size="small"
          />
        </UndecoratedLink>
      }
      links={[
        {
          children: 'Workspace',
          href: getSettingsPagePath(SettingsPath.Workspace),
        },
        {
          children: 'Objects',
        },
      ]}
    >
      <SettingsPageContainer>
        <>
          <SettingsObjectCoverImage />
          <Section>
            <H2Title title="Existing objects" />

            <StyledSearchInput
              LeftIcon={IconSearch}
              placeholder="Search an object..."
              value={searchTerm}
              onChange={setSearchTerm}
            />

            <Table>
              <StyledObjectTableRow>
                {SETTINGS_OBJECT_TABLE_METADATA.fields.map(
                  (settingsObjectsTableMetadataField) => (
                    <SortableTableHeader
                      key={settingsObjectsTableMetadataField.fieldName}
                      fieldName={settingsObjectsTableMetadataField.fieldName}
                      label={settingsObjectsTableMetadataField.fieldLabel}
                      tableId={SETTINGS_OBJECT_TABLE_METADATA.tableId}
                      align={settingsObjectsTableMetadataField.align}
                      initialSort={SETTINGS_OBJECT_TABLE_METADATA.initialSort}
                    />
                  ),
                )}
                <TableHeader></TableHeader>
              </StyledObjectTableRow>
              {isNonEmptyArray(sortedActiveObjectSettingsItems) && (
                <TableSection title="Active">
                  {filteredActiveObjectSettingsItems.map(
                    (objectSettingsItem) => (
                      <SettingsObjectMetadataItemTableRow
                        key={objectSettingsItem.objectMetadataItem.namePlural}
                        objectMetadataItem={
                          objectSettingsItem.objectMetadataItem
                        }
                        totalObjectCount={objectSettingsItem.totalObjectCount}
                        action={
                          <StyledIconChevronRight
                            size={theme.icon.size.md}
                            stroke={theme.icon.stroke.sm}
                          />
                        }
                        link={`/settings/objects/${getObjectSlug(
                          objectSettingsItem.objectMetadataItem,
                        )}`}
                      />
                    ),
                  )}
                </TableSection>
              )}
              {isNonEmptyArray(inactiveObjectMetadataItems) && (
                <TableSection title="Inactive">
                  {filteredInactiveObjectSettingsItems.map(
                    (objectSettingsItem) => (
                      <SettingsObjectMetadataItemTableRow
                        key={objectSettingsItem.objectMetadataItem.namePlural}
                        objectMetadataItem={
                          objectSettingsItem.objectMetadataItem
                        }
                        totalObjectCount={objectSettingsItem.totalObjectCount}
                        action={
                          <SettingsObjectInactiveMenuDropDown
                            isCustomObject={
                              objectSettingsItem.objectMetadataItem.isCustom
                            }
                            scopeKey={
                              objectSettingsItem.objectMetadataItem.namePlural
                            }
                            onActivate={() =>
                              updateOneObjectMetadataItem({
                                idToUpdate:
                                  objectSettingsItem.objectMetadataItem.id,
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
                    ),
                  )}
                </TableSection>
              )}
            </Table>
          </Section>
        </>
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
