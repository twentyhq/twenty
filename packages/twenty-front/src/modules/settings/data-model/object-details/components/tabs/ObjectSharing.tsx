import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { H2Title } from 'twenty-ui/typography';
import { Section } from 'twenty-ui/layout';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { isDDLLockedState } from '@/client-config/states/isDDLLockedState';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { isObjectMetadataReadOnly } from '@/object-record/read-only/utils/isObjectMetadataReadOnly';
import { SettingsObjectSharingLevelSection } from '@/settings/data-model/sharing/components/SettingsObjectSharingLevelSection';
import { SettingsObjectSharingOwnerFieldSection } from '@/settings/data-model/sharing/components/SettingsObjectSharingOwnerFieldSection';
import { SettingsObjectSharingRulesSection } from '@/settings/data-model/sharing/components/SettingsObjectSharingRulesSection';
import { useIsRecordLevelPermissionEntitlementEnabled } from '@/settings/roles/hooks/useIsRecordLevelPermissionEntitlementEnabled';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

type ObjectSharingProps = {
  objectMetadataItem: EnrichedObjectMetadataItem;
};

const StyledContentContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[8]};
`;

const StyledFormSectionContainer = styled.div`
  > * {
    padding-left: 0 !important;
  }
`;

export const ObjectSharing = ({ objectMetadataItem }: ObjectSharingProps) => {
  const { t } = useLingui();
  const isDDLLocked = useAtomStateValue(isDDLLockedState);
  const hasOrganizationPlan = useIsRecordLevelPermissionEntitlementEnabled();

  const isReadOnly =
    isObjectMetadataReadOnly({ objectMetadataItem }) || isDDLLocked;

  return (
    <StyledContentContainer>
      <StyledFormSectionContainer>
        <Section>
          <H2Title
            title={t`Level`}
            description={t`Who can read the records of this object`}
          />
          <SettingsObjectSharingLevelSection
            objectMetadataItem={objectMetadataItem}
            isReadOnly={isReadOnly}
          />
        </Section>
      </StyledFormSectionContainer>
      <StyledFormSectionContainer>
        <Section>
          <H2Title
            title={t`Owner`}
            description={t`The field naming the member who owns each record`}
          />
          <SettingsObjectSharingOwnerFieldSection
            objectMetadataItem={objectMetadataItem}
            isReadOnly={isReadOnly}
          />
        </Section>
      </StyledFormSectionContainer>
      <StyledFormSectionContainer>
        <Section>
          <H2Title
            title={t`Sharing rules`}
            description={t`Grant access to records matching criteria to everyone, a role or a member`}
          />
          <SettingsObjectSharingRulesSection
            objectMetadataItem={objectMetadataItem}
            hasOrganizationPlan={hasOrganizationPlan}
            isReadOnly={isReadOnly}
          />
        </Section>
      </StyledFormSectionContainer>
    </StyledContentContainer>
  );
};
