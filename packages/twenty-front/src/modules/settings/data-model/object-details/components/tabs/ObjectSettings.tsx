import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';

import { useUpdateOneObjectMetadataItem } from '@/object-metadata/hooks/useUpdateOneObjectMetadataItem';
import { SettingsUpdateDataModelObjectAboutForm } from '@/settings/data-model/object-details/components/SettingsUpdateDataModelObjectAboutForm';
import { SettingsDataModelObjectSettingsFormCard } from '@/settings/data-model/objects/forms/components/SettingsDataModelObjectSettingsFormCard';
import { SettingsPath } from '@/types/SettingsPath';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { H2Title, IconArchive } from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import { Section } from 'twenty-ui/layout';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';

type ObjectSettingsProps = {
  objectMetadataItem: ObjectMetadataItem;
};

const StyledContentContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(8)};
`;

const StyledFormSection = styled(Section)`
  padding-left: 0 !important;
`;

export const ObjectSettings = ({ objectMetadataItem }: ObjectSettingsProps) => {
  const { t } = useLingui();
  const navigate = useNavigateSettings();
  const { updateOneObjectMetadataItem } = useUpdateOneObjectMetadataItem();
  const handleDisable = async () => {
    await updateOneObjectMetadataItem({
      idToUpdate: objectMetadataItem.id,
      updatePayload: { isActive: false },
    });
    navigate(SettingsPath.Objects);
  };

  return (
    <StyledContentContainer>
      <StyledFormSection>
        <H2Title
          title={t`About`}
          description={t`Name in both singular (e.g., 'Invoice') and plural (e.g., 'Invoices') forms.`}
        />
        <SettingsUpdateDataModelObjectAboutForm
          objectMetadataItem={objectMetadataItem}
        />
      </StyledFormSection>
      <StyledFormSection>
        <Section>
          <H2Title
            title={t`Options`}
            description={t`Choose the fields that will identify your records`}
          />
          <SettingsDataModelObjectSettingsFormCard
            objectMetadataItem={objectMetadataItem}
          />
        </Section>
      </StyledFormSection>
      <StyledFormSection>
        <Section>
          <H2Title title={t`Danger zone`} description={t`Deactivate object`} />
          <Button
            Icon={IconArchive}
            title={t`Deactivate`}
            size="small"
            onClick={handleDisable}
          />
        </Section>
      </StyledFormSection>
    </StyledContentContainer>
  );
};
