import { TooltipDelay } from '@/ui/layout/tooltip/constants/TooltipDelay';
import { useLingui } from '@lingui/react/macro';
import { IconPlus } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import { Tooltip } from 'twenty-ui/primitives/surfaces';

type SettingsRolePermissionsObjectOverrideNewRuleButtonProps = {
  objectLabelPlural: string;
  hasFullObjectAccess: boolean;
  onClick: () => void;
};

export const SettingsRolePermissionsObjectOverrideNewRuleButton = ({
  objectLabelPlural,
  hasFullObjectAccess,
  onClick,
}: SettingsRolePermissionsObjectOverrideNewRuleButtonProps) => {
  const { t } = useLingui();

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
          onClick={onClick}
        >
          {t`New record-level permission`}
        </Button>
      </span>
    </Tooltip>
  );
};
