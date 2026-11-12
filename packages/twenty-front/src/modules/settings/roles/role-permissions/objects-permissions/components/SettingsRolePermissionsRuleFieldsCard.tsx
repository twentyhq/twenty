import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { SettingsOptionCardContentSelect } from '@/settings/components/SettingsOptions/SettingsOptionCardContentSelect';
import { StyledSettingsSelectGroup } from '@/settings/components/SettingsOptions/StyledSettingsSelectGroup';
import { SettingsRolePermissionsObjectFieldsSelect } from '@/settings/roles/role-permissions/objects-permissions/components/SettingsRolePermissionsObjectFieldsSelect';
import { settingsDraftRoleFamilyState } from '@/settings/roles/states/settingsDraftRoleFamilyState';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { useLingui } from '@lingui/react/macro';
import { IconEye, IconPencil } from 'twenty-ui/icon';
import { Card } from 'twenty-ui/primitives/surfaces';

const RULE_FIELDS_SELECT_WIDTH = 200;

type SettingsRolePermissionsRuleFieldsCardProps = {
  roleId: string;
  objectMetadataItem: EnrichedObjectMetadataItem;
  ruleRootGroupId: string;
};

export const SettingsRolePermissionsRuleFieldsCard = ({
  roleId,
  objectMetadataItem,
  ruleRootGroupId,
}: SettingsRolePermissionsRuleFieldsCardProps) => {
  const { t } = useLingui();

  const settingsDraftRole = useAtomFamilyStateValue(
    settingsDraftRoleFamilyState,
    roleId,
  );

  const rootPredicateGroup =
    settingsDraftRole.rowLevelPermissionPredicateGroups?.find(
      (predicateGroup) => predicateGroup.id === ruleRootGroupId,
    );

  const canRuleRead = rootPredicateGroup?.canReadRecords ?? false;
  const canRuleUpdate = rootPredicateGroup?.canUpdateRecords ?? false;

  return (
    <StyledSettingsSelectGroup controlWidth={RULE_FIELDS_SELECT_WIDTH}>
      <Card.Root>
        <SettingsOptionCardContentSelect
          Icon={IconEye}
          title={t`Fields to see`}
          description={t`Fields shown on matching records`}
          divider
        >
          <SettingsRolePermissionsObjectFieldsSelect
            roleId={roleId}
            objectMetadataItem={objectMetadataItem}
            mode="read"
            ruleRootGroupId={ruleRootGroupId}
            disabled={!settingsDraftRole.isEditable || !canRuleRead}
          />
        </SettingsOptionCardContentSelect>
        <SettingsOptionCardContentSelect
          Icon={IconPencil}
          title={t`Fields to edit`}
          description={t`Fields editable on matching records`}
        >
          <SettingsRolePermissionsObjectFieldsSelect
            roleId={roleId}
            objectMetadataItem={objectMetadataItem}
            mode="update"
            ruleRootGroupId={ruleRootGroupId}
            disabled={!settingsDraftRole.isEditable || !canRuleUpdate}
          />
        </SettingsOptionCardContentSelect>
      </Card.Root>
    </StyledSettingsSelectGroup>
  );
};
