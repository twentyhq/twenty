import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styled from '@emotion/styled';

import { useFieldMetadata } from '@/metadata/hooks/useFieldMetadata';
import { useObjectMetadata } from '@/metadata/hooks/useObjectMetadata';
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
  const { activeObjects, disableObject, findActiveObjectBySlug } =
    useObjectMetadata();
  const activeObject = findActiveObjectBySlug(objectSlug);

  useEffect(() => {
    if (activeObjects.length && !activeObject) {
      navigate(AppPath.NotFound);
    }
  }, [activeObject, activeObjects.length, navigate]);

  const { activateField, disableField, eraseField } = useFieldMetadata();
  const activeFields = activeObject?.fields.filter(
    (fieldItem) => fieldItem.isActive,
  );
  const disabledFields = activeObject?.fields.filter(
    (fieldItem) => !fieldItem.isActive,
  );

  return (
    <SubMenuTopBarContainer Icon={IconSettings} title="Settings">
      <SettingsPageContainer>
        <Breadcrumb
          links={[
            { children: 'Objects', href: '/settings/objects' },
            { children: activeObject?.labelPlural ?? '' },
          ]}
        />
        {activeObject && (
          <SettingsAboutSection
            iconKey={activeObject.icon ?? undefined}
            name={activeObject.labelPlural || ''}
            isCustom={activeObject.isCustom}
            onDisable={() => {
              disableObject(activeObject);
              navigate('/settings/objects');
            }}
            onEdit={() => navigate('./edit')}
          />
        )}
        <Section>
          <H2Title
            title="Fields"
            description={`Customise the fields available in the ${activeObject?.labelSingular} views and their display order in the ${activeObject?.labelSingular} detail view and menus.`}
          />
          <Table>
            <StyledObjectFieldTableRow>
              <TableHeader>Name</TableHeader>
              <TableHeader>Field type</TableHeader>
              <TableHeader>Data type</TableHeader>
              <TableHeader></TableHeader>
            </StyledObjectFieldTableRow>
            {!!activeFields?.length && (
              <TableSection title="Active">
                {activeFields.map((fieldItem) => (
                  <SettingsObjectFieldItemTableRow
                    key={fieldItem.id}
                    fieldItem={fieldItem}
                    ActionIcon={
                      <SettingsObjectFieldActiveActionDropdown
                        isCustomField={fieldItem.isCustom}
                        scopeKey={fieldItem.id}
                        onEdit={() => navigate(`./${fieldItem.name}`)}
                        onDisable={() => disableField(fieldItem)}
                      />
                    }
                  />
                ))}
              </TableSection>
            )}
            {!!disabledFields?.length && (
              <TableSection isInitiallyExpanded={false} title="Disabled">
                {disabledFields.map((fieldItem) => (
                  <SettingsObjectFieldItemTableRow
                    key={fieldItem.id}
                    fieldItem={fieldItem}
                    ActionIcon={
                      <SettingsObjectFieldDisabledActionDropdown
                        isCustomField={fieldItem.isCustom}
                        scopeKey={fieldItem.id}
                        onActivate={() => activateField(fieldItem)}
                        onErase={() => eraseField(fieldItem)}
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
                  disabledFields?.length
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
