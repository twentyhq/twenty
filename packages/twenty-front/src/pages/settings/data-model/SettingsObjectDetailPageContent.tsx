import { useUpdateOneObjectMetadataItem } from '@/object-metadata/hooks/useUpdateOneObjectMetadataItem';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { getDisabledFieldMetadataItems } from '@/object-metadata/utils/getDisabledFieldMetadataItems';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsObjectSummaryCard } from '@/settings/data-model/object-details/components/SettingsObjectSummaryCard';
import { getSettingsPagePath } from '@/settings/utils/getSettingsPagePath';
import { SettingsPath } from '@/types/SettingsPath';
import { Button } from '@/ui/input/button/components/Button';
import { SubMenuTopBarContainer } from '@/ui/layout/page/SubMenuTopBarContainer';
import { Section } from '@/ui/layout/section/components/Section';
import { Breadcrumb } from '@/ui/navigation/bread-crumb/components/Breadcrumb';
import { UndecoratedLink } from '@/ui/navigation/link/components/UndecoratedLink';
import styled from '@emotion/styled';
import { isNonEmptyArray } from '@sniptt/guards';
import { useNavigate } from 'react-router-dom';
import { H2Title, IconHierarchy2, IconPlus } from 'twenty-ui';
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
    <SubMenuTopBarContainer
      Icon={IconHierarchy2}
      title={
        <Breadcrumb
          links={[
            { children: 'Objetos', href: '/settings/objects' },
            { children: objectMetadataItem.labelPlural },
          ]}
        />
      }
    >
      <SettingsPageContainer>
        <Section>
          <H2Title title="Sobre" description="Gerencie seu objeto" />
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
            title="Campos"
            description={`Personalize os campos disponíveis nas visualizações de ${objectMetadataItem.labelSingular} e sua ordem de exibição na visualização de detalhes e menus de ${objectMetadataItem.labelSingular}.`}
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
                  title="Adicionar Campo"
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
