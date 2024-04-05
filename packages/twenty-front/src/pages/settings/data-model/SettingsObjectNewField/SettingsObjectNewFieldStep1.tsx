import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styled from '@emotion/styled';
import { IconMinus, IconPlus, IconSettings } from 'twenty-ui';

import { useFieldMetadataItem } from '@/object-metadata/hooks/useFieldMetadataItem';
import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { isLabelIdentifierField } from '@/object-metadata/utils/isLabelIdentifierField';
import { SaveAndCancelButtons } from '@/settings/components/SaveAndCancelButtons/SaveAndCancelButtons';
import { SettingsHeaderContainer } from '@/settings/components/SettingsHeaderContainer';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import {
  SettingsObjectFieldItemTableRow,
  StyledObjectFieldTableRow,
} from '@/settings/data-model/object-details/components/SettingsObjectFieldItemTableRow';
import { AppPath } from '@/types/AppPath';
import { H2Title } from '@/ui/display/typography/components/H2Title';
import { Button } from '@/ui/input/button/components/Button';
import { LightIconButton } from '@/ui/input/button/components/LightIconButton';
import { SubMenuTopBarContainer } from '@/ui/layout/page/SubMenuTopBarContainer';
import { Section } from '@/ui/layout/section/components/Section';
import { Table } from '@/ui/layout/table/components/Table';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableSection } from '@/ui/layout/table/components/TableSection';
import { Breadcrumb } from '@/ui/navigation/bread-crumb/components/Breadcrumb';

const StyledSection = styled(Section)`
  display: flex;
  flex-direction: column;
`;

const StyledAddCustomFieldButton = styled(Button)`
  align-self: flex-end;
  margin-top: ${({ theme }) => theme.spacing(2)};
`;

export const SettingsObjectNewFieldStep1 = () => {
  const navigate = useNavigate();

  const { objectSlug = '' } = useParams();
  const { findActiveObjectMetadataItemBySlug } =
    useFilteredObjectMetadataItems();

  const activeObjectMetadataItem =
    findActiveObjectMetadataItemBySlug(objectSlug);

  const { activateMetadataField, disableMetadataField } =
    useFieldMetadataItem();
  const [metadataFields, setMetadataFields] = useState(
    activeObjectMetadataItem?.fields ?? [],
  );

  const activeMetadataFields = metadataFields.filter((field) => field.isActive);
  const disabledMetadataFields = metadataFields.filter(
    (field) => !field.isActive,
  );

  const canSave = metadataFields.some(
    (field, index) =>
      field.isActive !== activeObjectMetadataItem?.fields[index].isActive,
  );

  useEffect(() => {
    if (!activeObjectMetadataItem) {
      navigate(AppPath.NotFound);
      return;
    }

    if (!metadataFields.length)
      setMetadataFields(activeObjectMetadataItem.fields);
  }, [activeObjectMetadataItem, metadataFields.length, navigate]);

  if (!activeObjectMetadataItem) return null;

  const handleToggleField = (fieldMetadataId: string) =>
    setMetadataFields((previousFields) =>
      previousFields.map((field) =>
        field.id === fieldMetadataId
          ? { ...field, isActive: !field.isActive }
          : field,
      ),
    );

  const handleSave = async () => {
    await Promise.all(
      metadataFields.map((metadataField, index) => {
        if (
          metadataField.isActive ===
          activeObjectMetadataItem.fields[index].isActive
        ) {
          return undefined;
        }

        return metadataField.isActive
          ? activateMetadataField(metadataField)
          : disableMetadataField(metadataField);
      }),
    );

    navigate(`/settings/objects/${objectSlug}`);
  };

  return (
    <SubMenuTopBarContainer Icon={IconSettings} title="Settings">
      <SettingsPageContainer>
        <SettingsHeaderContainer>
          <Breadcrumb
            links={[
              { children: 'Objects', href: '/settings/objects' },
              {
                children: activeObjectMetadataItem.labelPlural,
                href: `/settings/objects/${objectSlug}`,
              },
              { children: 'New Field' },
            ]}
          />
          {!activeObjectMetadataItem.isRemote && (
            <SaveAndCancelButtons
              isSaveDisabled={!canSave}
              onCancel={() => navigate(`/settings/objects/${objectSlug}`)}
              onSave={handleSave}
            />
          )}
        </SettingsHeaderContainer>
        <StyledSection>
          <H2Title
            title="Check disabled fields"
            description="Before creating a custom field, check if it already exists in the disabled section."
          />
          <Table>
            <StyledObjectFieldTableRow>
              <TableHeader>Name</TableHeader>
              <TableHeader>Field type</TableHeader>
              <TableHeader>Data type</TableHeader>
              <TableHeader></TableHeader>
            </StyledObjectFieldTableRow>
            {!!activeMetadataFields.length && (
              <TableSection isInitiallyExpanded={false} title="Active">
                {activeMetadataFields.map((activeMetadataField) => (
                  <SettingsObjectFieldItemTableRow
                    key={activeMetadataField.id}
                    fieldMetadataItem={activeMetadataField}
                    ActionIcon={
                      isLabelIdentifierField({
                        fieldMetadataItem: activeMetadataField,
                        objectMetadataItem: activeObjectMetadataItem,
                      }) ? undefined : (
                        <LightIconButton
                          Icon={IconMinus}
                          accent="tertiary"
                          onClick={() =>
                            handleToggleField(activeMetadataField.id)
                          }
                        />
                      )
                    }
                  />
                ))}
              </TableSection>
            )}
            {!!disabledMetadataFields.length && (
              <TableSection title="Disabled">
                {disabledMetadataFields.map((disabledMetadataField) => (
                  <SettingsObjectFieldItemTableRow
                    key={disabledMetadataField.name}
                    fieldMetadataItem={disabledMetadataField}
                    ActionIcon={
                      <LightIconButton
                        Icon={IconPlus}
                        accent="tertiary"
                        onClick={() =>
                          handleToggleField(disabledMetadataField.id)
                        }
                      />
                    }
                  />
                ))}
              </TableSection>
            )}
          </Table>
          <StyledAddCustomFieldButton
            Icon={IconPlus}
            title="Add Custom Field"
            size="small"
            variant="secondary"
            onClick={() =>
              navigate(`/settings/objects/${objectSlug}/new-field/step-2`)
            }
          />
        </StyledSection>
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
