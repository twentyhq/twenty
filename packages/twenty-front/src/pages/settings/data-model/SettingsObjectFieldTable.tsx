import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import {
  SettingsObjectFieldItemTableRow,
  StyledObjectFieldTableRow,
} from '@/settings/data-model/object-details/components/SettingsObjectFieldItemTableRow';
import { settingsObjectFieldsFamilyState } from '@/settings/data-model/object-details/states/settingsObjectFieldsFamilyState';
import { SettingsTextInput } from '@/ui/input/components/SettingsTextInput';
import { SortableTableHeader } from '@/ui/layout/table/components/SortableTableHeader';
import { Table } from '@/ui/layout/table/components/Table';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableSection } from '@/ui/layout/table/components/TableSection';
import { useSortedArray } from '@/ui/layout/table/hooks/useSortedArray';
import { TableMetadata } from '@/ui/layout/table/types/TableMetadata';
import styled from '@emotion/styled';
import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyArray } from '@sniptt/guards';
import { useEffect, useMemo, useState } from 'react';
import { useRecoilState } from 'recoil';
import { IconSearch } from 'twenty-ui/display';
import { useMapFieldMetadataItemToSettingsObjectDetailTableItem } from '~/pages/settings/data-model/hooks/useMapFieldMetadataItemToSettingsObjectDetailTableItem';
import { SettingsObjectDetailTableItem } from '~/pages/settings/data-model/types/SettingsObjectDetailTableItem';

const GET_SETTINGS_OBJECT_DETAIL_TABLE_METADATA_STANDARD: TableMetadata<SettingsObjectDetailTableItem> =
  {
    tableId: 'settingsObjectDetail',
    fields: [
      {
        fieldLabel: msg`Name`,
        fieldName: 'label',
        fieldType: 'string',
        align: 'left',
      },
      {
        fieldLabel: msg`Field type`,
        fieldName: 'fieldType',
        fieldType: 'string',
        align: 'left',
      },
      {
        fieldLabel: msg`Data type`,
        fieldName: 'dataType',
        fieldType: 'string',
        align: 'left',
      },
    ],
    initialSort: {
      fieldName: 'label',
      orderBy: 'AscNullsLast',
    },
  };

const GET_SETTINGS_OBJECT_DETAIL_TABLE_METADATA_CUSTOM: TableMetadata<SettingsObjectDetailTableItem> =
  {
    tableId: 'settingsObjectDetail',
    fields: [
      {
        fieldLabel: msg`Name`,
        fieldName: 'label',
        fieldType: 'string',
        align: 'left',
      },
      {
        fieldLabel: msg`Identifier`,
        fieldName: 'identifierType',
        fieldType: 'string',
        align: 'left',
      },
      {
        fieldLabel: msg`Data type`,
        fieldName: 'dataType',
        fieldType: 'string',
        align: 'left',
      },
    ],
    initialSort: {
      fieldName: 'label',
      orderBy: 'AscNullsLast',
    },
  };

const StyledSearchInput = styled(SettingsTextInput)`
  padding-bottom: ${({ theme }) => theme.spacing(2)};
  width: 100%;
`;
export type SettingsObjectFieldTableProps = {
  objectMetadataItem: ObjectMetadataItem;
  mode: 'view' | 'new-field';
};

// TODO: find another way than using mode which feels like it could be replaced by another pattern
export const SettingsObjectFieldTable = ({
  objectMetadataItem,
  mode,
}: SettingsObjectFieldTableProps) => {
  const { t } = useLingui();
  const [searchTerm, setSearchTerm] = useState('');

  const tableMetadata = objectMetadataItem.isCustom
    ? GET_SETTINGS_OBJECT_DETAIL_TABLE_METADATA_CUSTOM
    : GET_SETTINGS_OBJECT_DETAIL_TABLE_METADATA_STANDARD;

  const { mapFieldMetadataItemToSettingsObjectDetailTableItem } =
    useMapFieldMetadataItemToSettingsObjectDetailTableItem(objectMetadataItem);

  const [settingsObjectFields, setSettingsObjectFields] = useRecoilState(
    settingsObjectFieldsFamilyState({
      objectMetadataItemId: objectMetadataItem.id,
    }),
  );

  useEffect(() => {
    setSettingsObjectFields(objectMetadataItem.fields);
  }, [objectMetadataItem, setSettingsObjectFields]);

  const activeObjectSettingsDetailItems = useMemo(() => {
    const activeMetadataFields = settingsObjectFields?.filter(
      (fieldMetadataItem) =>
        fieldMetadataItem.isActive && !fieldMetadataItem.isSystem,
    );

    return (
      activeMetadataFields?.map(
        mapFieldMetadataItemToSettingsObjectDetailTableItem,
      ) ?? []
    );
  }, [
    settingsObjectFields,
    mapFieldMetadataItemToSettingsObjectDetailTableItem,
  ]);

  const disabledObjectSettingsDetailItems = useMemo(() => {
    const disabledFieldMetadataItems = settingsObjectFields?.filter(
      (fieldMetadataItem) =>
        !fieldMetadataItem.isActive && !fieldMetadataItem.isSystem,
    );

    return (
      disabledFieldMetadataItems?.map(
        mapFieldMetadataItemToSettingsObjectDetailTableItem,
      ) ?? []
    );
  }, [
    settingsObjectFields,
    mapFieldMetadataItemToSettingsObjectDetailTableItem,
  ]);

  const sortedActiveObjectSettingsDetailItems = useSortedArray(
    activeObjectSettingsDetailItems,
    tableMetadata,
  );

  const sortedDisabledObjectSettingsDetailItems = useSortedArray(
    disabledObjectSettingsDetailItems,
    tableMetadata,
  );

  const filteredActiveItems = useMemo(
    () =>
      sortedActiveObjectSettingsDetailItems.filter(
        (item) =>
          item.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.dataType.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
    [sortedActiveObjectSettingsDetailItems, searchTerm],
  );

  const filteredDisabledItems = useMemo(
    () =>
      sortedDisabledObjectSettingsDetailItems.filter(
        (item) =>
          item.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.dataType.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
    [sortedDisabledObjectSettingsDetailItems, searchTerm],
  );

  return (
    <>
      <StyledSearchInput
        instanceId="object-field-table-search"
        LeftIcon={IconSearch}
        placeholder={t`Search a field...`}
        value={searchTerm}
        onChange={setSearchTerm}
      />
      <Table>
        <StyledObjectFieldTableRow>
          {tableMetadata.fields.map((item) => (
            <SortableTableHeader
              key={item.fieldName}
              fieldName={item.fieldName}
              label={t(item.fieldLabel)}
              tableId={tableMetadata.tableId}
              initialSort={tableMetadata.initialSort}
            />
          ))}
          <TableHeader></TableHeader>
        </StyledObjectFieldTableRow>
        {isNonEmptyArray(filteredActiveItems) && (
          <TableSection title={t`Active`}>
            {filteredActiveItems.map((objectSettingsDetailItem) => (
              <SettingsObjectFieldItemTableRow
                key={objectSettingsDetailItem.fieldMetadataItem.id}
                settingsObjectDetailTableItem={objectSettingsDetailItem}
                status="active"
                mode={mode}
              />
            ))}
          </TableSection>
        )}
        {isNonEmptyArray(filteredDisabledItems) && (
          <TableSection
            isInitiallyExpanded={mode === 'new-field' ? true : false}
            title={t`Inactive`}
          >
            {filteredDisabledItems.map((objectSettingsDetailItem) => (
              <SettingsObjectFieldItemTableRow
                key={objectSettingsDetailItem.fieldMetadataItem.id}
                settingsObjectDetailTableItem={objectSettingsDetailItem}
                status="disabled"
                mode={mode}
              />
            ))}
          </TableSection>
        )}
      </Table>
    </>
  );
};
