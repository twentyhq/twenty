/* @license Enterprise */

import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { Section } from 'twenty-ui/components/layout';
import { IconArrowUp, IconLock, IconTrash } from 'twenty-ui/icon';
import { Card } from 'twenty-ui/primitives/surfaces';

import { billingState } from '@/client-config/states/billingState';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { SettingsOptionCardContentButton } from '@/settings/components/SettingsOptions/SettingsOptionCardContentButton';
import { SettingsRolePermissionsObjectLevelRecordLevelPermissionFilterBuilder } from '@/settings/roles/role-permissions/object-level-permissions/record-level-permissions/components/SettingsRolePermissionsObjectLevelRecordLevelPermissionFilterBuilder';
import { RECORD_LEVEL_PERMISSION_REMOVE_RULES_CONFIRMATION_MODAL_ID } from '@/settings/roles/role-permissions/object-level-permissions/record-level-permissions/constants/RecordLevelPermissionRemoveRulesConfirmationModalId';
import { useRemoveRecordLevelPermissionRulesInDraftRole } from '@/settings/roles/role-permissions/object-level-permissions/record-level-permissions/hooks/useRemoveRecordLevelPermissionRulesInDraftRole';
import { settingsDraftRoleFamilyState } from '@/settings/roles/states/settingsDraftRoleFamilyState';
import { ConfirmationDialog } from '@/ui/layout/dialog/components/ConfirmationDialog';
import { useDialog } from '@/ui/layout/dialog/hooks/useDialog';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { SettingsPath } from 'twenty-shared/types';
import { Button } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';
import { OrganizationAdornment } from '@/settings/enterprise/components/OrganizationAdornment';

const StyledContent = styled.div`
  padding-bottom: ${themeCssVariables.spacing[2]};
`;

const StyledCardContainer = styled.div`
  margin-top: ${themeCssVariables.spacing[4]};
  overflow: hidden;
`;

const StyledHint = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.sm};
`;

type SettingsRolePermissionsObjectLevelRecordLevelSectionProps = {
  objectMetadataItem: EnrichedObjectMetadataItem;
  roleId: string;
  hasOrganizationPlan: boolean;
  isCurrentWorkspaceMemberAdmin: boolean;
};

export const SettingsRolePermissionsObjectLevelRecordLevelSection = ({
  objectMetadataItem,
  roleId,
  hasOrganizationPlan,
  isCurrentWorkspaceMemberAdmin,
}: SettingsRolePermissionsObjectLevelRecordLevelSectionProps) => {
  const navigateSettings = useNavigateSettings();
  const billing = useAtomStateValue(billingState);
  const isBillingEnabled = billing?.isBillingEnabled ?? false;

  const { openDialog } = useDialog();

  const settingsDraftRole = useAtomFamilyStateValue(
    settingsDraftRoleFamilyState,
    roleId,
  );

  const { removeRecordLevelPermissionRulesInDraftRole } =
    useRemoveRecordLevelPermissionRulesInDraftRole(roleId);

  const hasRecordLevelPermissionRules = (
    settingsDraftRole.rowLevelPermissionPredicates ?? []
  ).some((predicate) => predicate.objectMetadataId === objectMetadataItem.id);

  const objectLabelPlural = objectMetadataItem.labelPlural;

  const handleRemoveRulesConfirmClick = () => {
    removeRecordLevelPermissionRulesInDraftRole(objectMetadataItem.id);
  };

  if (!hasOrganizationPlan && !hasRecordLevelPermissionRules) {
    return (
      <Section.Root>
        <Section.Header
          title={t`Record-level`}
          description={t`Ability to filter the records a user can interact with`}
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

  if (!hasOrganizationPlan) {
    return (
      <Section.Root>
        <Section.Header
          title={t`Record-level`}
          description={t`These rules still apply. Upgrade to edit them.`}
          actions={<OrganizationAdornment />}
        />
        <StyledContent>
          <SettingsRolePermissionsObjectLevelRecordLevelPermissionFilterBuilder
            roleId={roleId}
            objectMetadataItem={objectMetadataItem}
            readonly
          />
        </StyledContent>
        {isCurrentWorkspaceMemberAdmin ? (
          <>
            <Button
              size="sm"
              startIcon={<IconTrash />}
              onClick={() =>
                openDialog(
                  RECORD_LEVEL_PERMISSION_REMOVE_RULES_CONFIRMATION_MODAL_ID,
                )
              }
              variant="outline"
              color="danger"
            >{t`Remove rules`}</Button>
            <ConfirmationDialog
              dialogId={
                RECORD_LEVEL_PERMISSION_REMOVE_RULES_CONFIRMATION_MODAL_ID
              }
              title={t`Remove record-level rules`}
              subtitle={t`The record-level rules on ${objectLabelPlural} will be removed from this role when you save it.`}
              onConfirmClick={handleRemoveRulesConfirmClick}
              confirmButtonText={t`Remove`}
              confirmButtonColor="danger"
            />
          </>
        ) : (
          <StyledHint>{t`Only Admins can remove these rules.`}</StyledHint>
        )}
      </Section.Root>
    );
  }

  return (
    <Section.Root>
      <Section.Header
        title={t`Record-level`}
        description={t`Ability to filter the records a user can interact with.`}
      />
      <StyledContent>
        <SettingsRolePermissionsObjectLevelRecordLevelPermissionFilterBuilder
          roleId={roleId}
          objectMetadataItem={objectMetadataItem}
        />
      </StyledContent>
    </Section.Root>
  );
};
