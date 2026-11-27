import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { useOpenRowLevelPermissionRulePage } from '@/settings/roles/role-permissions/object-overrides/hooks/useOpenRowLevelPermissionRulePage';
import { useRowLevelPermissionRulesInDraftRole } from '@/settings/roles/role-permissions/object-overrides/hooks/useRowLevelPermissionRulesInDraftRole';
import { TooltipDelay } from '@/ui/layout/tooltip/constants/TooltipDelay';
import { useLingui } from '@lingui/react/macro';
import { IconPlus } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import { Tooltip } from 'twenty-ui/primitives/surfaces';

type SettingsRolePermissionsObjectOverrideNewRuleButtonProps = {
  roleId: string;
  objectMetadataItem: Pick<EnrichedObjectMetadataItem, 'id' | 'labelPlural'>;
  hasFullObjectAccess: boolean;
};

export const SettingsRolePermissionsObjectOverrideNewRuleButton = ({
  roleId,
  objectMetadataItem,
  hasFullObjectAccess,
}: SettingsRolePermissionsObjectOverrideNewRuleButtonProps) => {
  const { t } = useLingui();
  const { createRule } = useRowLevelPermissionRulesInDraftRole(roleId);
  const { openRowLevelPermissionRulePage } = useOpenRowLevelPermissionRulePage({
    roleId,
    objectMetadataId: objectMetadataItem.id,
  });

  const objectLabelPlural = objectMetadataItem.labelPlural.toLocaleLowerCase();

  const handleClick = () => {
    openRowLevelPermissionRulePage(createRule(objectMetadataItem.id));
  };

  return (
    <Tooltip
      content={t`Record-level permissions only add access, and this role already has full access to ${objectLabelPlural}`}
      side="bottom"
      positionMethod="fixed"
      delay={TooltipDelay.shortDelay}
      disabled={!hasFullObjectAccess}
    >
      <span tabIndex={hasFullObjectAccess ? 0 : undefined}>
        <Button
          size="sm"
          variant="outline"
          startIcon={<IconPlus />}
          disabled={hasFullObjectAccess}
          onClick={handleClick}
        >
          {t`New record-level permission`}
        </Button>
      </span>
    </Tooltip>
  );
};
