import { useDeleteOneObjectMetadataItem } from '@/object-metadata/hooks/useDeleteOneObjectMetadataItem';
import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { useUpdateOneObjectMetadataItem } from '@/object-metadata/hooks/useUpdateOneObjectMetadataItem';
import { useCombinedGetTotalCount } from '@/object-record/multiple-objects/hooks/useCombinedGetTotalCount';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import {
  SettingsObjectMetadataItemTableRow,
  StyledObjectTableRow,
} from '@/settings/data-model/object-details/components/SettingsObjectItemTableRow';
import { SettingsObjectCoverImage } from '@/settings/data-model/objects/components/SettingsObjectCoverImage';
import { SettingsObjectInactiveMenuDropDown } from '@/settings/data-model/objects/components/SettingsObjectInactiveMenuDropDown';
import { getObjectTypeLabel } from '@/settings/data-model/utils/getObjectTypeLabel';
import { SettingsPath } from '@/types/SettingsPath';
import { SettingsTextInput } from '@/ui/input/components/SettingsTextInput';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { SortableTableHeader } from '@/ui/layout/table/components/SortableTableHeader';
import { Table } from '@/ui/layout/table/components/Table';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableSection } from '@/ui/layout/table/components/TableSection';
import { useSortedArray } from '@/ui/layout/table/hooks/useSortedArray';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { Trans, useLingui } from '@lingui/react/macro';
import { isNonEmptyArray } from '@sniptt/guards';
import { useMemo, useState } from 'react';
import {
  H2Title,
  IconChevronRight,
  IconPlus,
  IconSearch,
} from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import { Section } from 'twenty-ui/layout';
import { UndecoratedLink } from 'twenty-ui/navigation';
import { GET_SETTINGS_OBJECT_TABLE_METADATA } from '~/pages/settings/data-model/constants/SettingsObjectTableMetadata';
import { SettingsObjectTableItem } from '~/pages/settings/data-model/types/SettingsObjectTableItem';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';

const StyledIconChevronRight = styled(IconChevronRight)`
  color: ${({ theme }) => theme.font.color.tertiary};
`;

const StyledSearchInput = styled(SettingsTextInput)`
  padding-bottom: ${({ theme }) => theme.spacing(2)};
  width: 100%;
`;

export const SettingsObjects = () => {
  const { t } = useLingui();
  const theme = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const { deleteOneObjectMetadataItem } = useDeleteOneObjectMetadataItem();
  const { updateOneObjectMetadataItem } = useUpdateOneObjectMetadataItem();

  const {
    activeNonSystemObjectMetadataItems,
    inactiveNonSystemObjectMetadataItems,
  } = useFilteredObjectMetadataItems();

  const { totalCountByObjectMetadataItemNamePlural } = useCombinedGetTotalCount(
    {
      objectMetadataItems: [
        ...activeNonSystemObjectMetadataItems,
        ...inactiveNonSystemObjectMetadataItems,
      ],
    },
  );

  const activeObjectSettingsArray = useMemo(
    () =>
      activeNonSystemObjectMetadataItems.map(
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
    [
      activeNonSystemObjectMetadataItems,
      totalCountByObjectMetadataItemNamePlural,
    ],
  );

  const inactiveObjectSettingsArray = useMemo(
    () =>
      inactiveNonSystemObjectMetadataItems.map(
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
    [
      inactiveNonSystemObjectMetadataItems,
      totalCountByObjectMetadataItemNamePlural,
    ],
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
      title={t`Data model`}
      actionButton={
        <UndecoratedLink to={getSettingsPath(SettingsPath.NewObject)}>
          <Button
            Icon={IconPlus}
            title={t`Add object`}
            accent="blue"
            size="small"
          />
        </UndecoratedLink>
      }
      links={[
        {
          children: <Trans>Workspace</Trans>,
          href: getSettingsPath(SettingsPath.Workspace),
        },
        { children: <Trans>Objects</Trans> },
      ]}
    >
      <SettingsPageContainer>
        <>
          <SettingsObjectCoverImage />
          <Section>
            <H2Title title={t`Existing objects`} />

            <StyledSearchInput
              instanceId="settings-objects-search"
              LeftIcon={IconSearch}
              placeholder={t`Search for an object...`}
              value={searchTerm}
              onChange={setSearchTerm}
            />

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
                      initialSort={
                        GET_SETTINGS_OBJECT_TABLE_METADATA.initialSort
                      }
                    />
                  ),
                )}
                <TableHeader></TableHeader>
              </StyledObjectTableRow>
              {isNonEmptyArray(sortedActiveObjectSettingsItems) && (
                <TableSection title={t`Active`}>
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
                        link={getSettingsPath(SettingsPath.ObjectDetail, {
                          objectNamePlural:
                            objectSettingsItem.objectMetadataItem.namePlural,
                        })}
                      />
                    ),
                  )}
                </TableSection>
              )}
              {isNonEmptyArray(inactiveNonSystemObjectMetadataItems) && (
                <TableSection title={t`Inactive`}>
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
                            objectMetadataItemNamePlural={
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
