import { useUpdateOneObjectMetadataItem } from '@/object-metadata/hooks/useUpdateOneObjectMetadataItem';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsObjectSummaryCard } from '@/settings/data-model/object-details/components/SettingsObjectSummaryCard';
import { getSettingsPagePath } from '@/settings/utils/getSettingsPagePath';
import { SettingsPath } from '@/types/SettingsPath';
import { Button } from '@/ui/input/button/components/Button';
import { SubMenuTopBarContainer } from '@/ui/layout/page/SubMenuTopBarContainer';
import { Section } from '@/ui/layout/section/components/Section';
import { UndecoratedLink } from '@/ui/navigation/link/components/UndecoratedLink';
import { isAdvancedModeEnabledState } from '@/ui/navigation/navigation-drawer/states/isAdvancedModeEnabledState';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import styled from '@emotion/styled';
import { useNavigate } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { H2Title, IconPlus } from 'twenty-ui';
import { SettingsObjectFieldTable } from '~/pages/settings/data-model/SettingsObjectFieldTable';
import { SettingsObjectIndexTable } from '~/pages/settings/data-model/SettingsObjectIndexTable';

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

  const shouldDisplayAddFieldButton = !objectMetadataItem.isRemote;

  const isAdvancedModeEnabled = useRecoilValue(isAdvancedModeEnabledState);

  const isUniqueIndexesEnabled = useIsFeatureEnabled(
    'IS_UNIQUE_INDEXES_ENABLED',
  );

  return (
    <SubMenuTopBarContainer
      title={objectMetadataItem.labelPlural}
      links={[
        {
          children: 'Workspace',
          href: getSettingsPagePath(SettingsPath.Workspace),
        },
        { children: 'Objects', href: '/settings/objects' },
        { children: objectMetadataItem.labelPlural },
      ]}
    >
      <SettingsPageContainer>
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
              <UndecoratedLink to={'./new-field/select'}>
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
        {isAdvancedModeEnabled && isUniqueIndexesEnabled && (
          <Section>
            <H2Title
              title="Indexes"
              description={`Advanced feature to improve the performance of queries and to enforce unicity constraints.`}
            />
            <SettingsObjectIndexTable objectMetadataItem={objectMetadataItem} />
          </Section>
        )}
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
