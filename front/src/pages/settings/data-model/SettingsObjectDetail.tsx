import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styled from '@emotion/styled';

import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import {
  activeFieldItems,
  activeObjectItems,
  disabledFieldItems,
} from '@/settings/data-model/constants/mockObjects';
import { SettingsAboutSection } from '@/settings/data-model/object-details/components/SettingsObjectAboutSection';
import {
  SettingsObjectFieldItemTableRow,
  StyledObjectFieldTableRow,
} from '@/settings/data-model/object-details/components/SettingsObjectFieldItemTableRow';
import { AppPath } from '@/types/AppPath';
import { IconDotsVertical, IconPlus, IconSettings } from '@/ui/display/icon';
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

  const { pluralObjectName = '' } = useParams();
  const activeObject = activeObjectItems.find(
    (activeObject) => activeObject.name.toLowerCase() === pluralObjectName,
  );

  useEffect(() => {
    if (!activeObject) navigate(AppPath.NotFound);
  }, [activeObject, navigate]);

  return (
    <SubMenuTopBarContainer Icon={IconSettings} title="Settings">
      <SettingsPageContainer>
        <Breadcrumb
          links={[
            { children: 'Objects', href: '/settings/objects' },
            { children: activeObject?.name ?? '' },
          ]}
        />
        {activeObject && (
          <SettingsAboutSection
            Icon={activeObject?.Icon}
            name={activeObject.name}
            type={activeObject.type}
          />
        )}
        <Section>
          <H2Title
            title="Fields"
            description={`Customise the fields available in the ${activeObject?.singularName} views and their display order in the ${activeObject?.singularName} detail view and menus.`}
          />
          <Table>
            <StyledObjectFieldTableRow>
              <TableHeader>Name</TableHeader>
              <TableHeader>Field type</TableHeader>
              <TableHeader>Data type</TableHeader>
              <TableHeader></TableHeader>
            </StyledObjectFieldTableRow>
            <TableSection title="Active">
              {activeFieldItems.map((fieldItem) => (
                <SettingsObjectFieldItemTableRow
                  key={fieldItem.name}
                  ActionIcon={IconDotsVertical}
                  fieldItem={fieldItem}
                />
              ))}
            </TableSection>
            {!!disabledFieldItems.length && (
              <TableSection isInitiallyExpanded={false} title="Disabled">
                {disabledFieldItems.map((fieldItem) => (
                  <SettingsObjectFieldItemTableRow
                    key={fieldItem.name}
                    ActionIcon={IconDotsVertical}
                    fieldItem={fieldItem}
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
                  disabledFieldItems.length
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
