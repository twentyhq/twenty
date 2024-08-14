import styled from '@emotion/styled';
import { useNavigate } from 'react-router-dom';
import { H2Title, IconPlus, IconSettings } from 'twenty-ui';

import { useUpdateOneObjectMetadataItem } from '@/object-metadata/hooks/useUpdateOneObjectMetadataItem';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';

import { getDisabledFieldMetadataItems } from '@/object-metadata/utils/getDisabledFieldMetadataItems';
import { SettingsObjectSummaryCard } from '@/settings/data-model/object-details/components/SettingsObjectSummaryCard';
import { getSettingsPagePath } from '@/settings/utils/getSettingsPagePath';
import { SettingsPath } from '@/types/SettingsPath';
import { Button } from '@/ui/input/button/components/Button';
import { SubMenuTopBarContainer } from '@/ui/layout/page/SubMenuTopBarContainer';
import { Section } from '@/ui/layout/section/components/Section';
import { Breadcrumb } from '@/ui/navigation/bread-crumb/components/Breadcrumb';
import { UndecoratedLink } from '@/ui/navigation/link/components/UndecoratedLink';
import { isNonEmptyArray } from '@sniptt/guards';
import { SettingsObjectFieldTable } from '~/pages/settings/data-model/SettingsObjectFieldTable';

const StyledDiv = styled.div`
  display: flex;
  justify-content: flex-end;
  padding-top: ${({ theme }) => theme.spacing(2)};
`;

export type SettingsObjectDetailPageContentProps = {
  objectMetadataItem: ObjectMetadataItem;
};

export const SettingsObjectDetailPageContent = ({
  objectMetadataItem,
}: SettingsObjectDetailPageContentProps) => {
  const navigate = useNavigate();

  const { updateOneObjectMetadataItem } = useUpdateOneObjectMetadataItem();

  const handleDisableObject = async () => {
    await updateOneObjectMetadataItem({
      idToUpdate: objectMetadataItem.id,
      updatePayload: { isActive: false },
    });
    navigate(getSettingsPagePath(SettingsPath.Objects));
  };

  const disabledFieldMetadataItems =
    getDisabledFieldMetadataItems(objectMetadataItem);

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
          <SettingsObjectFieldTable
            objectMetadataItem={objectMetadataItem}
            mode="view"
          />
          {shouldDisplayAddFieldButton && (
            <StyledDiv>
              <UndecoratedLink
                to={
                  isNonEmptyArray(disabledFieldMetadataItems)
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
