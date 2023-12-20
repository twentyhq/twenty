import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styled from '@emotion/styled';

import { useFieldMetadataItem } from '@/object-metadata/hooks/useFieldMetadataItem';
import { useObjectMetadataItemForSettings } from '@/object-metadata/hooks/useObjectMetadataItemForSettings';
import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { getFieldSlug } from '@/object-metadata/utils/getFieldSlug';
import { isLabelIdentifierField } from '@/object-metadata/utils/isLabelIdentifierField';
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
  const { disableObjectMetadataItem, findActiveObjectMetadataItemBySlug } =
    useObjectMetadataItemForSettings();

  const activeObjectMetadataItem =
    findActiveObjectMetadataItemBySlug(objectSlug);

  useEffect(() => {
    if (!activeObjectMetadataItem) navigate(AppPath.NotFound);
  }, [activeObjectMetadataItem, navigate]);

  const { activateMetadataField, disableMetadataField, eraseMetadataField } =
    useFieldMetadataItem();

  if (!activeObjectMetadataItem) return null;

  const activeMetadataFields = activeObjectMetadataItem.fields.filter(
    (metadataField) => metadataField.isActive && !metadataField.isSystem,
  );
  const disabledMetadataFields = activeObjectMetadataItem.fields.filter(
    (metadataField) => !metadataField.isActive && !metadataField.isSystem,
  );

  const handleDisableObject = async () => {
    await disableObjectMetadataItem(activeObjectMetadataItem);
    navigate('/settings/objects');
  };

  const handleDisableField = async (
    activeFieldMetadatItem: FieldMetadataItem,
  ) => {
    disableMetadataField(activeFieldMetadatItem);
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
        <SettingsAboutSection
          iconKey={activeObjectMetadataItem.icon ?? undefined}
          name={activeObjectMetadataItem.labelPlural || ''}
          isCustom={activeObjectMetadataItem.isCustom}
          onDisable={handleDisableObject}
          onEdit={() => navigate('./edit')}
        />
        <Section>
          <H2Title
            title="Fields"
            description={`Customise the fields available in the ${activeObjectMetadataItem.labelSingular} views and their display order in the ${activeObjectMetadataItem.labelSingular} detail view and menus.`}
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
                    fieldMetadataItem={activeMetadataField}
                    ActionIcon={
                      <SettingsObjectFieldActiveActionDropdown
                        isCustomField={!!activeMetadataField.isCustom}
                        scopeKey={activeMetadataField.id}
                        onEdit={() =>
                          navigate(`./${getFieldSlug(activeMetadataField)}`)
                        }
                        onDisable={
                          isLabelIdentifierField({
                            fieldMetadataItem: activeMetadataField,
                            objectMetadataItem: activeObjectMetadataItem,
                          })
                            ? undefined
                            : () => handleDisableField(activeMetadataField)
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
                    fieldMetadataItem={disabledMetadataField}
                    ActionIcon={
                      <SettingsObjectFieldDisabledActionDropdown
                        isCustomField={!!disabledMetadataField.isCustom}
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
