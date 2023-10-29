import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styled from '@emotion/styled';

import { useMetadataField } from '@/metadata/hooks/useMetadataField';
import { useMetadataObjectForSettings } from '@/metadata/hooks/useMetadataObjectForSettings';
import { getFieldSlug } from '@/metadata/utils/getFieldSlug';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsAboutSection } from '@/settings/data-model/object-details/components/SettingsObjectAboutSection';
import { SettingsObjectFieldActiveActionDropdown } from '@/settings/data-model/object-details/components/SettingsObjectFieldActiveActionDropdown';
import { SettingsObjectFieldDisabledActionDropdown } from '@/settings/data-model/object-details/components/SettingsObjectFieldDisabledActionDropdown';
import {
  SettingsObjectFieldItemTableRow,
  StyledObjectFieldTableRow,
} from '@/settings/data-model/object-details/components/SettingsObjectFieldItemTableRow';
import { AppPath } from '@/types/AppPath';
import { IconPlus, IconSettings } from '@/ui/display/icon';
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
  const { disableMetadataObject, findActiveMetadataObjectBySlug, loading } =
    useMetadataObjectForSettings();

  const activeMetadataObject = findActiveMetadataObjectBySlug(objectSlug);

  useEffect(() => {
    if (loading) return;
    if (!activeMetadataObject) navigate(AppPath.NotFound);
  }, [activeMetadataObject, loading, navigate]);

  const { activateMetadataField, disableMetadataField, eraseMetadataField } =
    useMetadataField();

  if (!activeMetadataObject) return null;

  const activeMetadataFields = activeMetadataObject.fields.filter(
    (metadataField) => metadataField.isActive,
  );
  const disabledMetadataFields = activeMetadataObject.fields.filter(
    (metadataField) => !metadataField.isActive,
  );

  const handleDisable = async () => {
    await disableMetadataObject(activeMetadataObject);
    navigate('/settings/objects');
  };

  return (
    <SubMenuTopBarContainer Icon={IconSettings} title="Settings">
      <SettingsPageContainer>
        <Breadcrumb
          links={[
            { children: 'Objects', href: '/settings/objects' },
            { children: activeMetadataObject.labelPlural },
          ]}
        />
        <SettingsAboutSection
          iconKey={activeMetadataObject.icon ?? undefined}
          name={activeMetadataObject.labelPlural || ''}
          isCustom={activeMetadataObject.isCustom}
          onDisable={handleDisable}
          onEdit={() => navigate('./edit')}
        />
        <Section>
          <H2Title
            title="Fields"
            description={`Customise the fields available in the ${activeMetadataObject.labelSingular} views and their display order in the ${activeMetadataObject.labelSingular} detail view and menus.`}
          />
          <Table>
            <StyledObjectFieldTableRow>
              <TableHeader>Name</TableHeader>
              <TableHeader>Field type</TableHeader>
              <TableHeader>Data type</TableHeader>
              <TableHeader></TableHeader>
            </StyledObjectFieldTableRow>
            {!!activeMetadataFields.length && (
              <TableSection title="Active">
                {activeMetadataFields.map((activeMetadataField) => (
                  <SettingsObjectFieldItemTableRow
                    key={activeMetadataField.id}
                    fieldItem={activeMetadataField}
                    ActionIcon={
                      <SettingsObjectFieldActiveActionDropdown
                        isCustomField={activeMetadataField.isCustom}
                        scopeKey={activeMetadataField.id}
                        onEdit={() =>
                          navigate(`./${getFieldSlug(activeMetadataField)}`)
                        }
                        onDisable={() =>
                          disableMetadataField(activeMetadataField)
                        }
                      />
                    }
                  />
                ))}
              </TableSection>
            )}
            {!!disabledMetadataFields.length && (
              <TableSection isInitiallyExpanded={false} title="Disabled">
                {disabledMetadataFields.map((disabledMetadataField) => (
                  <SettingsObjectFieldItemTableRow
                    key={disabledMetadataField.id}
                    fieldItem={disabledMetadataField}
                    ActionIcon={
                      <SettingsObjectFieldDisabledActionDropdown
                        isCustomField={disabledMetadataField.isCustom}
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
