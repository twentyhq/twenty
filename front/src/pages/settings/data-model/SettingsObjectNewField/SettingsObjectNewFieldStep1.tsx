import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styled from '@emotion/styled';

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
  const { activeObjects, findActiveObjectBySlug } = useObjectMetadata();
  const activeObject = findActiveObjectBySlug(objectSlug);

  useEffect(() => {
    if (activeObjects.length && !activeObject) {
      navigate(AppPath.NotFound);
    }
  }, [activeObject, activeObjects.length, navigate]);

  const activeFields = activeObject?.fields.filter(
    (fieldItem) => fieldItem.isActive,
  );
  const disabledFields = activeObject?.fields.filter(
    (fieldItem) => !fieldItem.isActive,
  );

  return (
    <SubMenuTopBarContainer Icon={IconSettings} title="Settings">
      <SettingsPageContainer>
        <SettingsHeaderContainer>
          <Breadcrumb
            links={[
              { children: 'Objects', href: '/settings/objects' },
              {
                children: activeObject?.labelPlural ?? '',
                href: `/settings/objects/${objectSlug}`,
              },
              { children: 'New Field' },
            ]}
          />
          <SaveAndCancelButtons
            isSaveDisabled
            onCancel={() => {
              navigate(`/settings/objects/${objectSlug}`);
            }}
            onSave={() => undefined}
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
            {!!activeFields?.length && (
              <TableSection isInitiallyExpanded={false} title="Active">
                {activeFields.map((fieldItem) => (
                  <SettingsObjectFieldItemTableRow
                    key={fieldItem.id}
                    fieldItem={fieldItem}
                    ActionIcon={
                      <LightIconButton Icon={IconMinus} accent="tertiary" />
                    }
                  />
                ))}
              </TableSection>
            )}
            {!!disabledFields?.length && (
              <TableSection title="Disabled">
                {disabledFields.map((fieldItem) => (
                  <SettingsObjectFieldItemTableRow
                    key={fieldItem.name}
                    fieldItem={fieldItem}
                    ActionIcon={
                      <LightIconButton Icon={IconPlus} accent="tertiary" />
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
