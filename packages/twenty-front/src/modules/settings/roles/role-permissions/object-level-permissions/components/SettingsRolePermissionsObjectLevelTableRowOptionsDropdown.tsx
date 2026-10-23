import { useObjectPermissionDerivedStates } from '@/settings/roles/role-permissions/object-level-permissions/field-permissions/hooks/useObjectPermissionDerivedStates';
import { useResetObjectPermission } from '@/settings/roles/role-permissions/object-level-permissions/hooks/useResetObjectPermission';
import { useRemoveRecordLevelPermissionRulesInDraftRole } from '@/settings/roles/role-permissions/object-level-permissions/record-level-permissions/hooks/useRemoveRecordLevelPermissionRulesInDraftRole';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import { t } from '@lingui/core/macro';
import { Link } from 'react-router-dom';
import { IconButton } from 'twenty-ui/components/input';
import { Dropdown } from 'twenty-ui/components/navigation';
import { IconDotsVertical, IconPencil, IconTrash } from 'twenty-ui/icon';

type SettingsRolePermissionsObjectLevelTableRowOptionsDropdownProps = {
  roleId: string;
  objectMetadataId: string;
  objectPermissionDetailUrl: string;
  isEditable: boolean;
  canRemoveRecordLevelPermissionRules: boolean;
};

export const SettingsRolePermissionsObjectLevelTableRowOptionsDropdown = ({
  roleId,
  objectMetadataId,
  objectPermissionDetailUrl,
  isEditable,
  canRemoveRecordLevelPermissionRules,
}: SettingsRolePermissionsObjectLevelTableRowOptionsDropdownProps) => {
  const dropdownId = `settings-role-object-level-options-${objectMetadataId}`;

  const { resetObjectPermission } = useResetObjectPermission(roleId);

  const { removeRecordLevelPermissionRulesInDraftRole } =
    useRemoveRecordLevelPermissionRulesInDraftRole(roleId);

  const {
    objectHasNoOverrideOnObjectPermission,
    objectHasNoOverrideButFieldPermissionsShouldBeTakenIntoAccount,
  } = useObjectPermissionDerivedStates({
    roleId,
    objectMetadataItemId: objectMetadataId,
  });

  const hasObjectOrFieldPermissionOverride =
    !objectHasNoOverrideOnObjectPermission ||
    objectHasNoOverrideButFieldPermissionsShouldBeTakenIntoAccount;

  const isRemoveRuleVisible =
    canRemoveRecordLevelPermissionRules || hasObjectOrFieldPermissionOverride;

  const handleRemoveRuleClick = () => {
    resetObjectPermission(objectMetadataId);

    if (canRemoveRecordLevelPermissionRules) {
      removeRecordLevelPermissionRulesInDraftRole(objectMetadataId);
    }
  };

  if (!isEditable) {
    return null;
  }

  return (
    <DropdownRoot dropdownId={dropdownId} type="menu">
      <Dropdown.Trigger
        render={
          <IconButton
            aria-label={t`Object permission options`}
            variant="ghost"
            size="sm"
          >
            <IconDotsVertical />
          </IconButton>
        }
      />
      <DropdownContent align="end">
        <Dropdown.Section>
          <Dropdown.ActionItem
            startIcon={<IconPencil />}
            render={<Link to={objectPermissionDetailUrl} />}
          >{t`Edit`}</Dropdown.ActionItem>
          {isRemoveRuleVisible && (
            <Dropdown.ActionItem
              startIcon={<IconTrash />}
              color="danger"
              onClick={handleRemoveRuleClick}
            >{t`Remove rule`}</Dropdown.ActionItem>
          )}
        </Dropdown.Section>
      </DropdownContent>
    </DropdownRoot>
  );
};
