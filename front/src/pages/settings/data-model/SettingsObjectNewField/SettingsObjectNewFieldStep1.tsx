import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styled from '@emotion/styled';

import { useFieldMetadata } from '@/metadata/hooks/useFieldMetadata';
import { useObjectMetadata } from '@/metadata/hooks/useObjectMetadata';
import { SaveAndCancelButtons } from '@/settings/components/SaveAndCancelButtons/SaveAndCancelButtons';
import { SettingsHeaderContainer } from '@/settings/components/SettingsHeaderContainer';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import {
  SettingsObjectFieldItemTableRow,
  StyledObjectFieldTableRow,
} from '@/settings/data-model/object-details/components/SettingsObjectFieldItemTableRow';
import { AppPath } from '@/types/AppPath';
import { IconMinus, IconPlus, IconSettings } from '@/ui/display/icon';
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
  const { findActiveObjectBySlug, loading } = useObjectMetadata();
  const activeObject = findActiveObjectBySlug(objectSlug);

  const { activateField, disableField } = useFieldMetadata();
  const [fields, setFields] = useState(activeObject?.fields ?? []);

  const activeFields = fields.filter((field) => field.isActive);
  const disabledFields = fields.filter((field) => !field.isActive);

  const canSave = fields.some(
    (field, index) => field.isActive !== activeObject?.fields[index].isActive,
  );

  useEffect(() => {
    if (loading) return;

    if (!activeObject) {
      navigate(AppPath.NotFound);
      return;
    }

    if (!fields.length) setFields(activeObject.fields);
  }, [activeObject, fields.length, loading, navigate]);

  if (!activeObject) return null;

  const handleToggleField = (fieldId: string) =>
    setFields((previousFields) =>
      previousFields.map((field) =>
        field.id === fieldId ? { ...field, isActive: !field.isActive } : field,
      ),
    );

  const handleSave = async () => {
    await Promise.all(
      fields.map((field, index) => {
        if (field.isActive === activeObject.fields[index].isActive) return;

        return field.isActive ? activateField(field) : disableField(field);
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
                children: activeObject.labelPlural,
                href: `/settings/objects/${objectSlug}`,
              },
              { children: 'New Field' },
            ]}
          />
          <SaveAndCancelButtons
            isSaveDisabled={!canSave}
            onCancel={() => navigate(`/settings/objects/${objectSlug}`)}
            onSave={handleSave}
          />
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
            {!!activeFields.length && (
              <TableSection isInitiallyExpanded={false} title="Active">
                {activeFields.map((field) => (
                  <SettingsObjectFieldItemTableRow
                    key={field.id}
                    fieldItem={field}
                    ActionIcon={
                      <LightIconButton
                        Icon={IconMinus}
                        accent="tertiary"
                        onClick={() => handleToggleField(field.id)}
                      />
                    }
                  />
                ))}
              </TableSection>
            )}
            {!!disabledFields.length && (
              <TableSection title="Disabled">
                {disabledFields.map((field) => (
                  <SettingsObjectFieldItemTableRow
                    key={field.name}
                    fieldItem={field}
                    ActionIcon={
                      <LightIconButton
                        Icon={IconPlus}
                        accent="tertiary"
                        onClick={() => handleToggleField(field.id)}
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
