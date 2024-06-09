import { useCallback, useState } from 'react';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import {
  H1Title,
  H2Title,
  IconArrowDown,
  IconArrowUp,
  IconChevronRight,
  IconPlus,
  IconSettings,
} from 'twenty-ui';

import { useDeleteOneObjectMetadataItem } from '@/object-metadata/hooks/useDeleteOneObjectMetadataItem';
import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { useUpdateOneObjectMetadataItem } from '@/object-metadata/hooks/useUpdateOneObjectMetadataItem';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { getObjectSlug } from '@/object-metadata/utils/getObjectSlug';
import { SettingsHeaderContainer } from '@/settings/components/SettingsHeaderContainer';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import {
  SettingsObjectItemTableRow,
  StyledObjectTableRow,
} from '@/settings/data-model/object-details/components/SettingsObjectItemTableRow';
import { SettingsObjectCoverImage } from '@/settings/data-model/objects/SettingsObjectCoverImage';
import { SettingsObjectInactiveMenuDropDown } from '@/settings/data-model/objects/SettingsObjectInactiveMenuDropDown';
import {
  getObjectTypeLabel,
  ObjectTypeLabel,
} from '@/settings/data-model/utils/getObjectTypeLabel';
import { getSettingsPagePath } from '@/settings/utils/getSettingsPagePath';
import { SettingsPath } from '@/types/SettingsPath';
import { Button } from '@/ui/input/button/components/Button';
import { SubMenuTopBarContainer } from '@/ui/layout/page/SubMenuTopBarContainer';
import { Section } from '@/ui/layout/section/components/Section';
import { Table } from '@/ui/layout/table/components/Table';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableSection } from '@/ui/layout/table/components/TableSection';
import { UndecoratedLink } from '@/ui/navigation/link/components/UndecoratedLink';
import { useTableSort } from '~/hooks/useTableSort';
enum SortKeys {
  labelPlural = 'labelPlural',
  objectTypeLabelText = 'objectTypeLabelText',
  fieldsCount = 'fieldsCount',
  instancesCount = 'instancesCount',
}
type InstanceCountStateType = { [key: string]: number };
type TableHeading = {
  label: string;
  sortKey: SortKeys;
  align?: 'center' | 'left' | 'right';
  type?: string;
}[];
export type MetadataFieldRowType = ObjectMetadataItem & {
  objectTypeLabelText: ObjectTypeLabel['labelText'];
  fieldsCount: number;
  instancesCount: number;
};
const StyledIconChevronRight = styled(IconChevronRight)`
  color: ${({ theme }) => theme.font.color.tertiary};
`;

const StyledH1Title = styled(H1Title)`
  margin-bottom: 0;
`;

const tableHeadings: TableHeading = [
  { label: 'Name', sortKey: SortKeys.labelPlural },
  { label: 'Type', sortKey: SortKeys.objectTypeLabelText },
  {
    label: 'Fields',
    sortKey: SortKeys.fieldsCount,
    align: 'right',
    type: 'number',
  },
  {
    label: 'Instances',
    sortKey: SortKeys.instancesCount,
    align: 'right',
    type: 'number',
  },
];

export const SettingsObjects = () => {
  const [instanceCountObj, setInstanceCount] = useState<InstanceCountStateType>(
    {},
  );
  const theme = useTheme();

  const { activeObjectMetadataItems, inactiveObjectMetadataItems } =
    useFilteredObjectMetadataItems();
  const { deleteOneObjectMetadataItem } = useDeleteOneObjectMetadataItem();
  const { updateOneObjectMetadataItem } = useUpdateOneObjectMetadataItem();
  const getRowData = (objectMetaDataItems: ObjectMetadataItem[]) =>
    objectMetaDataItems.map((objectItem) => ({
      ...objectItem,
      [SortKeys.objectTypeLabelText]: getObjectTypeLabel(objectItem).labelText,
      [SortKeys.fieldsCount]: objectItem.fields.filter(
        (field) => !field.isSystem,
      ).length,
      [SortKeys.instancesCount]: instanceCountObj[objectItem.id],
    }));

  const activeRowData: MetadataFieldRowType[] = getRowData(
    activeObjectMetadataItems,
  );

  const inActiveRowData: MetadataFieldRowType[] = getRowData(
    inactiveObjectMetadataItems,
  );

  const [sortedActiveObjectMetadataItems, handleActiveSort, sortConfig] =
    useTableSort<MetadataFieldRowType>(SortKeys.labelPlural, activeRowData);
  const [sortedInActiveObjectMetadataItems, handleInActiveSort] =
    useTableSort<MetadataFieldRowType>(SortKeys.labelPlural, inActiveRowData);
  const handleSort = (key: keyof MetadataFieldRowType) => {
    handleActiveSort(key);
    handleInActiveSort(key);
  };

  const updateInstanceCount = useCallback((id: string, val: number) => {
    setInstanceCount((prevState: InstanceCountStateType) => ({
      ...prevState,
      [id]: val,
    }));
  }, []);
  const SortIcon = ({ sortKey }: { sortKey: SortKeys }) => {
    if (sortKey !== sortConfig.sortByColumnKey) return null;
    return sortConfig.sortOrder === 'ascending' ? (
      <IconArrowUp size="14" />
    ) : (
      <IconArrowDown size="14" />
    );
  };

  return (
    <SubMenuTopBarContainer Icon={IconSettings} title="Settings">
      <SettingsPageContainer>
        <SettingsHeaderContainer>
          <StyledH1Title title="Objects" />
          <UndecoratedLink to={getSettingsPagePath(SettingsPath.NewObject)}>
            <Button
              Icon={IconPlus}
              title="Add object"
              accent="blue"
              size="small"
            />
          </UndecoratedLink>
        </SettingsHeaderContainer>
        <div>
          <SettingsObjectCoverImage />
          <Section>
            <H2Title title="Existing objects" />
            <Table>
              <StyledObjectTableRow>
                {tableHeadings.map((item) => (
                  <TableHeader
                    key={item.label}
                    align={item?.align}
                    onClick={() => handleSort(item.sortKey)}
                  >
                    {sortConfig.sortByColumnKey === item.sortKey &&
                      item.type === 'number' && (
                        <SortIcon sortKey={item.sortKey} />
                      )}
                    {item.label}
                    {sortConfig.sortByColumnKey === item.sortKey &&
                      item.type !== 'number' && (
                        <SortIcon sortKey={item.sortKey} />
                      )}
                  </TableHeader>
                ))}
                <TableHeader></TableHeader>
              </StyledObjectTableRow>
              {!!sortedActiveObjectMetadataItems.length && (
                <TableSection title="Active">
                  {sortedActiveObjectMetadataItems.map(
                    (activeObjectMetadataItem) => (
                      <SettingsObjectItemTableRow
                        key={activeObjectMetadataItem.namePlural}
                        updateInstanceCount={updateInstanceCount}
                        objectItem={activeObjectMetadataItem}
                        action={
                          <StyledIconChevronRight
                            size={theme.icon.size.md}
                            stroke={theme.icon.stroke.sm}
                          />
                        }
                        to={`/settings/objects/${getObjectSlug(
                          activeObjectMetadataItem,
                        )}`}
                      />
                    ),
                  )}
                </TableSection>
              )}
              {!!inactiveObjectMetadataItems.length && (
                <TableSection title="Inactive">
                  {sortedInActiveObjectMetadataItems.map(
                    (inactiveObjectMetadataItem) => (
                      <SettingsObjectItemTableRow
                        key={inactiveObjectMetadataItem.namePlural}
                        updateInstanceCount={updateInstanceCount}
                        objectItem={inactiveObjectMetadataItem}
                        action={
                          <SettingsObjectInactiveMenuDropDown
                            isCustomObject={inactiveObjectMetadataItem.isCustom}
                            scopeKey={inactiveObjectMetadataItem.namePlural}
                            onActivate={() =>
                              updateOneObjectMetadataItem({
                                idToUpdate: inactiveObjectMetadataItem.id,
                                updatePayload: { isActive: true },
                              })
                            }
                            onDelete={() =>
                              deleteOneObjectMetadataItem(
                                inactiveObjectMetadataItem.id,
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
        </div>
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
