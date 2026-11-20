import { useLingui } from '@lingui/react/macro';
import { type ReactNode } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { type IconComponent } from 'twenty-ui/icon';

import { CommandMenuItemSectionGroup } from '@/command-menu-item/display/components/CommandMenuItemSectionGroup';
import { CommandMenuItemSwitch } from '@/command-menu/components/CommandMenuItemSwitch';
import { CORE_AGENT_RECORD_ACCESS_LEVELS } from '@/object-core/agents/constants/CoreAgentRecordAccessLevels';
import { type CoreAgentRecordAccessLevel } from '@/object-core/agents/types/CoreAgentRecordAccessLevel';
import { getCoreAgentRecordAccessItemId } from '@/object-core/agents/utils/getCoreAgentRecordAccessItemId';
import { getCoreAgentRecordAccessLevels } from '@/object-core/agents/utils/getCoreAgentRecordAccessLevels';
import { type RoleWithPartialMembers } from '@/settings/roles/types/RoleWithPartialMembers';
import {
  SETTINGS_ROLE_OBJECT_PERMISSION_ICON_CONFIG,
  type SettingsRoleObjectPermissionKey,
} from '@/settings/roles/role-permissions/object-overrides/constants/SettingsRoleObjectPermissionIconConfig';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';

type SidePanelCoreAgentRecordAccessGroupProps = {
  heading: string;
  Icon?: IconComponent;
  objectIcon?: ReactNode;
  role: RoleWithPartialMembers | undefined;
  objectMetadataId?: string;
  disabledOperations?: SettingsRoleObjectPermissionKey[];
  disabledOperationReasons?: Partial<
    Record<SettingsRoleObjectPermissionKey, string>
  >;
  isReadOnly: boolean;
  onLevelChange: ({
    level,
    isEnabled,
  }: {
    level: CoreAgentRecordAccessLevel;
    isEnabled: boolean;
  }) => void;
};

export const SidePanelCoreAgentRecordAccessGroup = ({
  heading,
  Icon,
  objectIcon,
  role,
  objectMetadataId,
  disabledOperations,
  disabledOperationReasons,
  isReadOnly,
  onLevelChange,
}: SidePanelCoreAgentRecordAccessGroupProps) => {
  const { t } = useLingui();

  const enabledLevels = getCoreAgentRecordAccessLevels({
    role,
    objectMetadataId,
    disabledOperations,
  });

  return (
    <CommandMenuItemSectionGroup
      heading={heading}
      Icon={Icon}
      context={isDefined(objectIcon) ? { icon: objectIcon } : undefined}
    >
      {CORE_AGENT_RECORD_ACCESS_LEVELS.map(
        ({ level, label, allRecordsLabel, objectKey }) => {
          const itemId = getCoreAgentRecordAccessItemId({
            objectMetadataId,
            level,
          });
          const isEnabled = enabledLevels.includes(level);
          const disabledReason = disabledOperationReasons?.[objectKey];
          const isDisabled = isReadOnly || isDefined(disabledReason);

          return (
            <SelectableListItem
              key={itemId}
              itemId={itemId}
              onEnter={() => {
                if (!isDisabled) {
                  onLevelChange({ level, isEnabled: !isEnabled });
                }
              }}
            >
              <CommandMenuItemSwitch
                id={itemId}
                LeftIcon={
                  SETTINGS_ROLE_OBJECT_PERMISSION_ICON_CONFIG[objectKey].Icon
                }
                text={t(isDefined(objectMetadataId) ? label : allRecordsLabel)}
                description={disabledReason}
                checked={isEnabled}
                onCheckedChange={(isChecked) =>
                  onLevelChange({ level, isEnabled: isChecked })
                }
                disabled={isDisabled}
              />
            </SelectableListItem>
          );
        },
      )}
    </CommandMenuItemSectionGroup>
  );
};
