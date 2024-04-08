import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styled from '@emotion/styled';
import { IconPlus, IconSettings } from 'twenty-ui';

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
import { H2Title } from '@/ui/display/typography/components/H2Title';
import { Button } from '@/ui/input/button/components/Button';
import { SubMenuTopBarContainer } from '@/ui/layout/page/SubMenuTopBarContainer';
import { Section } from '@/ui/layout/section/components/Section';
import { Table } from '@/ui/layout/table/components/Table';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableSection } from '@/ui/layout/table/components/TableSection';
import { Breadcrumb } from '@/ui/navigation/bread-crumb/components/Breadcrumb';

const StyledDiv = styled.div`
  display: flex;
  justify-content: flex-end;
  padding-top: ${({ theme }) => theme.spacing(2)};
`;

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

  const { activateMetadataField, disableMetadataField, eraseMetadataField } =
    useFieldMetadataItem();

  if (!activeObjectMetadataItem) return null;

  const activeMetadataFields = getActiveFieldMetadataItems(
    activeObjectMetadataItem,
  );
  const disabledMetadataFields = getDisabledFieldMetadataItems(
    activeObjectMetadataItem,
  );

  const handleDisableObject = async () => {
    await updateOneObjectMetadataItem({
      idToUpdate: activeObjectMetadataItem.id,
      updatePayload: { isActive: false },
    });
    navigate(getSettingsPagePath(SettingsPath.Objects));
  };

  const handleDisableField = (activeFieldMetadatItem: FieldMetadataItem) => {
    disableMetadataField(activeFieldMetadatItem);
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
            isCustom={activeObjectMetadataItem.isCustom}
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
              <TableHeader>Name</TableHeader>
              <TableHeader>
                {activeObjectMetadataItem.isCustom
                  ? 'Identifier'
                  : 'Field type'}
              </TableHeader>
              <TableHeader>Data type</TableHeader>
              <TableHeader></TableHeader>
            </StyledObjectFieldTableRow>
            {!!activeMetadataFields.length && (
              <TableSection title="Active">
                {activeMetadataFields.map((activeMetadataField) => {
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
                      key={activeMetadataField.id}
                      identifierType={getFieldIdentifierType(
                        activeMetadataField,
                        activeObjectMetadataItem,
                      )}
                      variant={
                        activeObjectMetadataItem.isCustom
                          ? 'identifier'
                          : 'field-type'
                      }
                      fieldMetadataItem={activeMetadataField}
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
            {!!disabledMetadataFields.length && (
              <TableSection isInitiallyExpanded={false} title="Inactive">
                {disabledMetadataFields.map((disabledMetadataField) => (
                  <SettingsObjectFieldItemTableRow
                    key={disabledMetadataField.id}
                    variant={
                      activeObjectMetadataItem.isCustom
                        ? 'identifier'
                        : 'field-type'
                    }
                    fieldMetadataItem={disabledMetadataField}
                    ActionIcon={
                      <SettingsObjectFieldInactiveActionDropdown
                        isCustomField={!!disabledMetadataField.isCustom}
                        fieldType={disabledMetadataField.type}
                        scopeKey={disabledMetadataField.id}
                        onActivate={() =>
                          activateMetadataField(disabledMetadataField)
                        }
                        onErase={() =>
                          eraseMetadataField(disabledMetadataField)
                        }
                      />
                    }
                  />
                ))}
              </TableSection>
            )}
          </Table>
          <StyledDiv>
            <Button
              Icon={IconPlus}
              title="Add Field"
              size="small"
              variant="secondary"
              onClick={() =>
                navigate(
                  disabledMetadataFields.length
                    ? './new-field/step-1'
                    : './new-field/step-2',
                )
              }
            />
          </StyledDiv>
        </Section>
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
