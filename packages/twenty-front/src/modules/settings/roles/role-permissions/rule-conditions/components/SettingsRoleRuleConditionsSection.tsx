/* @license Enterprise */

import { styled } from '@linaria/react';
import { Section } from 'twenty-ui/components/layout';
import { IconArrowUp, IconLock } from 'twenty-ui/icon';
import { Card } from 'twenty-ui/primitives/surfaces';

import { billingState } from '@/client-config/states/billingState';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { SettingsOptionCardContentButton } from '@/settings/components/SettingsOptions/SettingsOptionCardContentButton';
import { SettingsRoleRuleConditionFilterBuilder } from '@/settings/roles/role-permissions/rule-conditions/components/SettingsRoleRuleConditionFilterBuilder';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { SettingsPath } from 'twenty-shared/types';
import { Button } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';
import { OrganizationAdornment } from '@/settings/enterprise/components/OrganizationAdornment';
import { useLingui } from '@lingui/react/macro';

const StyledContent = styled.div`
  padding-bottom: ${themeCssVariables.spacing[2]};
`;

const StyledCardContainer = styled.div`
  margin-top: ${themeCssVariables.spacing[4]};
  overflow: hidden;
`;

type SettingsRoleRuleConditionsSectionProps = {
  objectMetadataItem: EnrichedObjectMetadataItem;
  roleId: string;
  rowLevelPermissionRuleId: string;
  hasOrganizationPlan: boolean;
};

export const SettingsRoleRuleConditionsSection = ({
  objectMetadataItem,
  roleId,
  rowLevelPermissionRuleId,
  hasOrganizationPlan,
}: SettingsRoleRuleConditionsSectionProps) => {
  const { t } = useLingui();
  const navigateSettings = useNavigateSettings();
  const billing = useAtomStateValue(billingState);
  const isBillingEnabled = billing?.isBillingEnabled ?? false;
  const objectLabelPlural = objectMetadataItem.labelPlural.toLocaleLowerCase();

  if (!hasOrganizationPlan) {
    return (
      <Section.Root>
        <Section.Header
          title={t`Condition`}
          description={t`Which ${objectLabelPlural} this rule applies to. Me is the person viewing.`}
          actions={<OrganizationAdornment />}
        />
        <StyledCardContainer>
          <Card.Root>
            <SettingsOptionCardContentButton
              Icon={IconLock}
              title={t`Upgrade to access`}
              description={t`This feature is part of the Organization plan`}
              Button={
                <Button
                  size="sm"
                  startIcon={<IconArrowUp />}
                  onClick={() =>
                    navigateSettings(
                      isBillingEnabled
                        ? SettingsPath.BillingPlans
                        : SettingsPath.AdminPanelOrganization,
                    )
                  }
                  variant="solid"
                  color="accent"
                >{t`Upgrade`}</Button>
              }
            />
          </Card.Root>
        </StyledCardContainer>
      </Section.Root>
    );
  }

  return (
    <Section.Root>
      <Section.Header
        title={t`Condition`}
        description={t`Which ${objectLabelPlural} this rule applies to. Me is the person viewing.`}
      />
      <StyledContent>
        <SettingsRoleRuleConditionFilterBuilder
          roleId={roleId}
          rowLevelPermissionRuleId={rowLevelPermissionRuleId}
          objectMetadataItem={objectMetadataItem}
        />
      </StyledContent>
    </Section.Root>
  );
};
