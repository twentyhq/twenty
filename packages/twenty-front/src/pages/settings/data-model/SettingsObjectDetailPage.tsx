import styled from '@emotion/styled';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { H2Title, IconPlus, IconSettings } from 'twenty-ui';

import { useUpdateOneObjectMetadataItem } from '@/object-metadata/hooks/useUpdateOneObjectMetadataItem';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { getActiveFieldMetadataItems } from '@/object-metadata/utils/getActiveFieldMetadataItems';
import { getDisabledFieldMetadataItems } from '@/object-metadata/utils/getDisabledFieldMetadataItems';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import {
  SettingsObjectFieldItemTableRow,
  StyledObjectFieldTableRow,
} from '@/settings/data-model/object-details/components/SettingsObjectFieldItemTableRow';
import { SettingsObjectSummaryCard } from '@/settings/data-model/object-details/components/SettingsObjectSummaryCard';
import { getSettingsPagePath } from '@/settings/utils/getSettingsPagePath';
import { SettingsPath } from '@/types/SettingsPath';
import { Button } from '@/ui/input/button/components/Button';
import { SubMenuTopBarContainer } from '@/ui/layout/page/SubMenuTopBarContainer';
import { Section } from '@/ui/layout/section/components/Section';
import { SortableTableHeader } from '@/ui/layout/table/components/SortableTableHeader';
import { Table } from '@/ui/layout/table/components/Table';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableSection } from '@/ui/layout/table/components/TableSection';
import { TableMetadata } from '@/ui/layout/table/types/TableMetadata';
import { Breadcrumb } from '@/ui/navigation/bread-crumb/components/Breadcrumb';
import { UndecoratedLink } from '@/ui/navigation/link/components/UndecoratedLink';
import { isNonEmptyArray } from '@sniptt/guards';
import { useSortedArray } from '~/hooks/useSortedArray';
import { useMapFieldMetadataItemToSettingsObjectDetailTableItem } from '~/pages/settings/data-model/hooks/useMapFieldMetadataItemToSettingsObjectDetailTableItem';
import { SettingsObjectDetailTableItem } from '~/pages/settings/data-model/types/SettingsObjectDetailTableItem';

const StyledDiv = styled.div`
  display: flex;
  justify-content: flex-end;
  padding-top: ${({ theme }) => theme.spacing(2)};
`;

const SETTINGS_OBJECT_DETAIL_TABLE_METADATA_STANDARD: TableMetadata<SettingsObjectDetailTableItem> =
  {
    tableId: 'settingsObjectDetail',
    fields: [
      {
        fieldLabel: 'Name',
        fieldName: 'label',
        fieldType: 'string',
        align: 'left',
      },
      {
        fieldLabel: 'Field type',
        fieldName: 'fieldType',
        fieldType: 'string',
        align: 'left',
      },
      {
        fieldLabel: 'Data type',
        fieldName: 'dataType',
        fieldType: 'string',
        align: 'left',
      },
    ],
  };

const SETTINGS_OBJECT_DETAIL_TABLE_METADATA_CUSTOM: TableMetadata<SettingsObjectDetailTableItem> =
  {
    tableId: 'settingsObjectDetail',
    fields: [
      {
        fieldLabel: 'Name',
        fieldName: 'label',
        fieldType: 'string',
        align: 'left',
      },
      {
        fieldLabel: 'Identifier',
        fieldName: 'identifier',
        fieldType: 'string',
        align: 'left',
      },
      {
        fieldLabel: 'Data type',
        fieldName: 'dataType',
        fieldType: 'string',
        align: 'left',
      },
    ],
  };

export type SettingsObjectDetailPageProps = {
  objectMetadataItem: ObjectMetadataItem;
};

export const SettingsObjectDetailPage = ({
  objectMetadataItem,
}: SettingsObjectDetailPageProps) => {
  const navigate = useNavigate();

  const { updateOneObjectMetadataItem } = useUpdateOneObjectMetadataItem();

  const { mapFieldMetadataItemToSettingsObjectDetailTableItem } =
    useMapFieldMetadataItemToSettingsObjectDetailTableItem(objectMetadataItem);

  const activeObjectSettingsDetailItems = useMemo(() => {
    const activeMetadataFields =
      getActiveFieldMetadataItems(objectMetadataItem);

    return activeMetadataFields.map(
      mapFieldMetadataItemToSettingsObjectDetailTableItem,
    );
  }, [objectMetadataItem, mapFieldMetadataItemToSettingsObjectDetailTableItem]);

  const disabledObjectSettingsDetailItems = useMemo(() => {
    const disabledFieldMetadataItems =
      getDisabledFieldMetadataItems(objectMetadataItem);

    return disabledFieldMetadataItems.map(
      mapFieldMetadataItemToSettingsObjectDetailTableItem,
    );
  }, [objectMetadataItem, mapFieldMetadataItemToSettingsObjectDetailTableItem]);

  const isCustomObject = objectMetadataItem.isCustom;

  const tableMetadata = isCustomObject
    ? SETTINGS_OBJECT_DETAIL_TABLE_METADATA_CUSTOM
    : SETTINGS_OBJECT_DETAIL_TABLE_METADATA_STANDARD;

  const sortedActiveObjectSettingsDetailItems = useSortedArray(
    activeObjectSettingsDetailItems,
    tableMetadata,
  );

  const sortedDisabledObjectSettingsDetailItems = useSortedArray(
    disabledObjectSettingsDetailItems,
    tableMetadata,
  );

  const handleDisableObject = async () => {
    await updateOneObjectMetadataItem({
      idToUpdate: objectMetadataItem.id,
      updatePayload: { isActive: false },
    });
    navigate(getSettingsPagePath(SettingsPath.Objects));
  };

  const shouldDisplayAddFieldButton = !objectMetadataItem.isRemote;

  return (
    <SubMenuTopBarContainer Icon={IconSettings} title="Settings">
      <SettingsPageContainer>
        <Breadcrumb
          links={[
            { children: 'Objects', href: '/settings/objects' },
            { children: objectMetadataItem.labelPlural },
          ]}
        />
        <Section>
          <H2Title title="About" description="Manage your object" />
          <SettingsObjectSummaryCard
            iconKey={objectMetadataItem.icon ?? undefined}
            name={objectMetadataItem.labelPlural || ''}
            objectMetadataItem={objectMetadataItem}
            onDeactivate={handleDisableObject}
            onEdit={() => navigate('./edit')}
          />
        </Section>
        <Section>
          <H2Title
            title="Fields"
            description={`Customise the fields available in the ${objectMetadataItem.labelSingular} views and their display order in the ${objectMetadataItem.labelSingular} detail view and menus.`}
          />
          <Table>
            <StyledObjectFieldTableRow>
              {tableMetadata.fields.map((item) => (
                <SortableTableHeader
                  key={item.fieldName}
                  fieldName={item.fieldName}
                  label={item.fieldLabel}
                  tableId={tableMetadata.tableId}
                />
              ))}
              <TableHeader></TableHeader>
            </StyledObjectFieldTableRow>
            {isNonEmptyArray(sortedActiveObjectSettingsDetailItems) && (
              <TableSection title="Active">
                {sortedActiveObjectSettingsDetailItems.map(
                  (objectSettingsDetailItem) => (
                    <SettingsObjectFieldItemTableRow
                      key={objectSettingsDetailItem.fieldMetadataItem.id}
                      settingsObjectDetailTableItem={objectSettingsDetailItem}
                      status="active"
                    />
                  ),
                )}
              </TableSection>
            )}
            {isNonEmptyArray(sortedDisabledObjectSettingsDetailItems) && (
              <TableSection isInitiallyExpanded={false} title="Inactive">
                {sortedDisabledObjectSettingsDetailItems.map(
                  (objectSettingsDetailItem) => (
                    <SettingsObjectFieldItemTableRow
                      key={objectSettingsDetailItem.fieldMetadataItem.id}
                      settingsObjectDetailTableItem={objectSettingsDetailItem}
                      status="disabled"
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
                  disabledObjectSettingsDetailItems.length
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
