/* @license Enterprise */

import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { H2Title, H3Title, IconArrowUp, IconLock } from 'twenty-ui/display';
import { Card, Section } from 'twenty-ui/layout';

import { billingState } from '@/client-config/states/billingState';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { SettingsOptionCardContentButton } from '@/settings/components/SettingsOptions/SettingsOptionCardContentButton';
import { SettingsRolePermissionsObjectLevelRecordLevelPermissionFilterBuilder } from '@/settings/roles/role-permissions/object-level-permissions/record-level-permissions/components/SettingsRolePermissionsObjectLevelRecordLevelPermissionFilterBuilder';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { SettingsPath } from 'twenty-shared/types';
import { Button } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { RowLevelPermissionPredicateScope } from '~/generated-metadata/graphql';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';

const StyledContent = styled.div`
  padding-bottom: ${themeCssVariables.spacing[2]};
`;

const StyledCardContainer = styled.div`
  margin-top: ${themeCssVariables.spacing[4]};
  overflow: hidden;
`;

const StyledScopeSections = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[4]};
`;

const StyledScopeSection = styled.div`
  border: 1px solid ${themeCssVariables.border.color.light};
  border-radius: ${themeCssVariables.border.radius.md};
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
  padding: ${themeCssVariables.spacing[4]};
`;

const StyledPillContainer = styled.span`
  align-items: center;
  background: ${themeCssVariables.background.secondary};
  border: 1px solid ${themeCssVariables.border.color.light};
  border-radius: 40px;
  color: ${themeCssVariables.font.color.tertiary};
  display: inline-flex;
  font-weight: ${themeCssVariables.font.weight.medium};
  gap: ${themeCssVariables.spacing[1]};
  padding: ${themeCssVariables.spacing[1]} ${themeCssVariables.spacing[2]};
`;

type SettingsRolePermissionsObjectLevelRecordLevelSectionProps = {
  objectMetadataItem: EnrichedObjectMetadataItem;
  roleId: string;
  hasOrganizationPlan: boolean;
};

const RECORD_LEVEL_PERMISSION_SCOPE_SECTIONS = [
  {
    scope: RowLevelPermissionPredicateScope.ALL,
    title: t`Read + write`,
    description: t`Rules applied when this role both views and edits records.`,
  },
  {
    scope: RowLevelPermissionPredicateScope.READ,
    title: t`Read only`,
    description: t`Rules applied only when this role views records.`,
  },
  {
    scope: RowLevelPermissionPredicateScope.WRITE,
    title: t`Write only`,
    description: t`Rules applied only when this role creates, updates, deletes, or restores records.`,
  },
] as const;

export const SettingsRolePermissionsObjectLevelRecordLevelSection = ({
  objectMetadataItem,
  roleId,
  hasOrganizationPlan,
}: SettingsRolePermissionsObjectLevelRecordLevelSectionProps) => {
  const navigateSettings = useNavigateSettings();
  const billing = useAtomStateValue(billingState);
  const isBillingEnabled = billing?.isBillingEnabled ?? false;

  if (!hasOrganizationPlan) {
    return (
      <Section>
        <H2Title
          title={t`Record-level`}
          description={t`Ability to filter the records a user can interact with`}
          adornment={
            <StyledPillContainer>
              <IconLock size={12} />
              {t`Organization`}
            </StyledPillContainer>
          }
        />
        <StyledCardContainer>
          <Card rounded>
            <SettingsOptionCardContentButton
              Icon={IconLock}
              title={t`Upgrade to access`}
              description={t`This feature is part of the Enterprise Plan`}
              Button={
                <Button
                  title={t`Upgrade`}
                  variant="primary"
                  accent="blue"
                  size="small"
                  Icon={IconArrowUp}
                  onClick={() =>
                    navigateSettings(
                      isBillingEnabled
                        ? SettingsPath.Billing
                        : SettingsPath.AdminPanelEnterprise,
                    )
                  }
                />
              }
            />
          </Card>
        </StyledCardContainer>
      </Section>
    );
  }

  return (
    <Section>
      <H2Title
        title={t`Record-level`}
        description={t`Ability to filter the records a user can view and edit.`}
      />
      <StyledContent>
        <StyledScopeSections>
          {RECORD_LEVEL_PERMISSION_SCOPE_SECTIONS.map((scopeSection) => (
            <StyledScopeSection key={scopeSection.scope}>
              <H3Title
                title={scopeSection.title}
                description={scopeSection.description}
              />
              <SettingsRolePermissionsObjectLevelRecordLevelPermissionFilterBuilder
                roleId={roleId}
                scope={scopeSection.scope}
                objectMetadataItem={objectMetadataItem}
              />
            </StyledScopeSection>
          ))}
        </StyledScopeSections>
      </StyledContent>
    </Section>
  );
};
