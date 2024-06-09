import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styled from '@emotion/styled';
import {
  H2Title,
  IconArrowDown,
  IconArrowUp,
  IconPlus,
  IconSettings,
} from 'twenty-ui';

import { LABEL_IDENTIFIER_FIELD_METADATA_TYPES } from '@/object-metadata/constants/LabelIdentifierFieldMetadataTypes';
import { useFieldMetadataItem } from '@/object-metadata/hooks/useFieldMetadataItem';
import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { useUpdateOneObjectMetadataItem } from '@/object-metadata/hooks/useUpdateOneObjectMetadataItem';
import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { getActiveFieldMetadataItems } from '@/object-metadata/utils/getActiveFieldMetadataItems';
import { getDisabledFieldMetadataItems } from '@/object-metadata/utils/getDisabledFieldMetadataItems';
import { getFieldSlug } from '@/object-metadata/utils/getFieldSlug';
import { isLabelIdentifierField } from '@/object-metadata/utils/isLabelIdentifierField';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsObjectFieldActiveActionDropdown } from '@/settings/data-model/object-details/components/SettingsObjectFieldActiveActionDropdown';
import { SettingsObjectFieldInactiveActionDropdown } from '@/settings/data-model/object-details/components/SettingsObjectFieldDisabledActionDropdown';
import {
  SettingsObjectFieldItemTableRow,
  StyledObjectFieldTableRow,
} from '@/settings/data-model/object-details/components/SettingsObjectFieldItemTableRow';
import { SettingsObjectSummaryCard } from '@/settings/data-model/object-details/components/SettingsObjectSummaryCard';
import { getFieldIdentifierType } from '@/settings/data-model/utils/getFieldIdentifierType';
import { getSettingsPagePath } from '@/settings/utils/getSettingsPagePath';
import { AppPath } from '@/types/AppPath';
import { SettingsPath } from '@/types/SettingsPath';
import { Button } from '@/ui/input/button/components/Button';
import { SubMenuTopBarContainer } from '@/ui/layout/page/SubMenuTopBarContainer';
import { Section } from '@/ui/layout/section/components/Section';
import { Table } from '@/ui/layout/table/components/Table';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableSection } from '@/ui/layout/table/components/TableSection';
import { Breadcrumb } from '@/ui/navigation/bread-crumb/components/Breadcrumb';
import { UndecoratedLink } from '@/ui/navigation/link/components/UndecoratedLink';
import { useTableSort } from '~/hooks/useTableSort';

const StyledDiv = styled.div`
  display: flex;
  justify-content: flex-end;
  padding-top: ${({ theme }) => theme.spacing(2)};
`;
enum SortKeys {
  label = 'label',
  fieldType = 'fieldType',
  dataType = 'dataType',
}
type MetadataFieldRowType = FieldMetadataItem & {
  fieldType: string | boolean;
  dataType?: string;
};
type DataTypesType = { [key: string]: string | undefined };

type TableHeading = {
  label: string;
  sortKey: SortKeys;
}[];

export const SettingsObjectDetail = () => {
  const navigate = useNavigate();

  const { objectSlug = '' } = useParams();
  const { findActiveObjectMetadataItemBySlug } =
    useFilteredObjectMetadataItems();
  const { updateOneObjectMetadataItem } = useUpdateOneObjectMetadataItem();

  const activeObjectMetadataItem =
    findActiveObjectMetadataItemBySlug(objectSlug);

  useEffect(() => {
    if (!activeObjectMetadataItem) navigate(AppPath.NotFound);
  }, [activeObjectMetadataItem, navigate]);

  const {
    activateMetadataField,
    deactivateMetadataField,
    deleteMetadataField,
  } = useFieldMetadataItem();
  const [dataTypes, setDataTypes] = useState<DataTypesType>({});
  let activeMetadataFieldsRows: MetadataFieldRowType[] = [];
  let deactivatedMetadataFieldRows: MetadataFieldRowType[] = [];

  if (activeObjectMetadataItem !== undefined) {
    const getMetadataFieldsRows = (MetadataFields: FieldMetadataItem[]) => {
      return MetadataFields.map((fieldMetadataItem) => {
        const getFieldType = () => {
          const variant = activeObjectMetadataItem.isCustom
            ? 'identifier'
            : 'field-type';
          const identifierType = getFieldIdentifierType(
            fieldMetadataItem,
            activeObjectMetadataItem,
          );
          if (variant === 'field-type') {
            return activeObjectMetadataItem.isRemote
              ? 'Remote'
              : fieldMetadataItem.isCustom
                ? 'Custom'
                : 'Standard';
          } else {
            return (
              !!identifierType &&
              (identifierType === 'label' ? 'Record text' : 'Record image')
            );
          }
        };

        return {
          ...fieldMetadataItem,
          [SortKeys.fieldType]: getFieldType(),
          [SortKeys.dataType]: dataTypes[fieldMetadataItem.id],
        };
      });
    };

    const activeMetadataFields = getActiveFieldMetadataItems(
      activeObjectMetadataItem,
    );
    const deactivatedMetadataFields = getDisabledFieldMetadataItems(
      activeObjectMetadataItem,
    );
    activeMetadataFieldsRows = getMetadataFieldsRows(activeMetadataFields);
    deactivatedMetadataFieldRows = getMetadataFieldsRows(
      deactivatedMetadataFields,
    );
  }

  const [sortedActiveMetadataFieldsRows, handleActiveSort, sortConfig] =
    useTableSort<MetadataFieldRowType>(
      SortKeys.label,
      activeMetadataFieldsRows,
    );

  const [sortedDeactivatedMetadataFieldsRows, handleDeactivatedSort] =
    useTableSort<MetadataFieldRowType>(
      SortKeys.label,
      deactivatedMetadataFieldRows,
    );

  const handleSort = (key: keyof MetadataFieldRowType) => {
    handleActiveSort(key);
    handleDeactivatedSort(key);
  };

  const updateDataTypes = useCallback((id: string, label?: string) => {
    setDataTypes((prevState: DataTypesType) => ({ ...prevState, [id]: label }));
  }, []);

  if (!activeObjectMetadataItem) return null;

  const handleDisableObject = async () => {
    await updateOneObjectMetadataItem({
      idToUpdate: activeObjectMetadataItem.id,
      updatePayload: { isActive: false },
    });
    navigate(getSettingsPagePath(SettingsPath.Objects));
  };

  const handleDisableField = (activeFieldMetadatItem: FieldMetadataItem) => {
    deactivateMetadataField(activeFieldMetadatItem);
  };

  const handleSetLabelIdentifierField = (
    activeFieldMetadatItem: FieldMetadataItem,
  ) =>
    updateOneObjectMetadataItem({
      idToUpdate: activeObjectMetadataItem.id,
      updatePayload: {
        labelIdentifierFieldMetadataId: activeFieldMetadatItem.id,
      },
    });

  const shouldDisplayAddFieldButton = !activeObjectMetadataItem.isRemote;
  const tableHeadings: TableHeading = [
    { label: 'Name', sortKey: SortKeys.label },
    {
      label: activeObjectMetadataItem.isCustom ? 'Identifier' : 'Field type',
      sortKey: SortKeys.fieldType,
    },
    {
      label: 'Data type',
      sortKey: SortKeys.dataType,
    },
  ];
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
        <Breadcrumb
          links={[
            { children: 'Objects', href: '/settings/objects' },
            { children: activeObjectMetadataItem.labelPlural },
          ]}
        />
        <Section>
          <H2Title title="About" description="Manage your object" />
          <SettingsObjectSummaryCard
            iconKey={activeObjectMetadataItem.icon ?? undefined}
            name={activeObjectMetadataItem.labelPlural || ''}
            objectMetadataItem={activeObjectMetadataItem}
            onDeactivate={handleDisableObject}
            onEdit={() => navigate('./edit')}
          />
        </Section>
        <Section>
          <H2Title
            title="Fields"
            description={`Customise the fields available in the ${activeObjectMetadataItem.labelSingular} views and their display order in the ${activeObjectMetadataItem.labelSingular} detail view and menus.`}
          />
          <Table>
            <StyledObjectFieldTableRow>
              {tableHeadings.map((item) => (
                <TableHeader
                  key={item.label}
                  onClick={() => handleSort(item.sortKey)}
                >
                  {item.label}
                  {sortConfig.sortByColumnKey === item.sortKey && (
                    <SortIcon sortKey={item.sortKey} />
                  )}
                </TableHeader>
              ))}

              <TableHeader></TableHeader>
            </StyledObjectFieldTableRow>
            {!!sortedActiveMetadataFieldsRows.length && (
              <TableSection title="Active">
                {sortedActiveMetadataFieldsRows.map((activeMetadataField) => {
                  const isLabelIdentifier = isLabelIdentifierField({
                    fieldMetadataItem: activeMetadataField,
                    objectMetadataItem: activeObjectMetadataItem,
                  });
                  const canBeSetAsLabelIdentifier =
                    activeObjectMetadataItem.isCustom &&
                    !isLabelIdentifier &&
                    LABEL_IDENTIFIER_FIELD_METADATA_TYPES.includes(
                      activeMetadataField.type,
                    );

                  return (
                    <SettingsObjectFieldItemTableRow
                      updateDataTypes={updateDataTypes}
                      key={activeMetadataField.id}
                      fieldMetadataItem={activeMetadataField}
                      isRemoteObjectField={activeObjectMetadataItem.isRemote}
                      // to={`./${getFieldSlug(activeMetadataField)}`}
                      ActionIcon={
                        <SettingsObjectFieldActiveActionDropdown
                          isCustomField={!!activeMetadataField.isCustom}
                          scopeKey={activeMetadataField.id}
                          onEdit={() =>
                            navigate(`./${getFieldSlug(activeMetadataField)}`)
                          }
                          onSetAsLabelIdentifier={
                            canBeSetAsLabelIdentifier
                              ? () =>
                                  handleSetLabelIdentifierField(
                                    activeMetadataField,
                                  )
                              : undefined
                          }
                          onDeactivate={
                            isLabelIdentifier
                              ? undefined
                              : () => handleDisableField(activeMetadataField)
                          }
                        />
                      }
                    />
                  );
                })}
              </TableSection>
            )}
            {!!sortedDeactivatedMetadataFieldsRows.length && (
              <TableSection isInitiallyExpanded={false} title="Inactive">
                {sortedDeactivatedMetadataFieldsRows.map(
                  (deactivatedMetadataField) => (
                    <SettingsObjectFieldItemTableRow
                      updateDataTypes={updateDataTypes}
                      key={deactivatedMetadataField.id}
                      variant={
                        activeObjectMetadataItem.isCustom
                          ? 'identifier'
                          : 'field-type'
                      }
                      fieldMetadataItem={deactivatedMetadataField}
                      ActionIcon={
                        <SettingsObjectFieldInactiveActionDropdown
                          isCustomField={!!deactivatedMetadataField.isCustom}
                          fieldType={deactivatedMetadataField.type}
                          scopeKey={deactivatedMetadataField.id}
                          onActivate={() =>
                            activateMetadataField(deactivatedMetadataField)
                          }
                          onDelete={() =>
                            deleteMetadataField(deactivatedMetadataField)
                          }
                        />
                      }
                    />
                  ),
                )}
              </TableSection>
            )}
          </Table>
          {shouldDisplayAddFieldButton && (
            <StyledDiv>
              <UndecoratedLink
                to={
                  sortedDeactivatedMetadataFieldsRows.length
                    ? './new-field/step-1'
                    : './new-field/step-2'
                }
              >
                <Button
                  Icon={IconPlus}
                  title="Add Field"
                  size="small"
                  variant="secondary"
                />
              </UndecoratedLink>
            </StyledDiv>
          )}
        </Section>
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
