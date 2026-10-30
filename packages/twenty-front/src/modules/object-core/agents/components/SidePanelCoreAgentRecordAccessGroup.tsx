import { useLingui } from '@lingui/react/macro';
import { type ReactNode } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { type IconComponent } from 'twenty-ui/icon';

import { CommandMenuItemSectionGroup } from '@/command-menu-item/display/components/CommandMenuItemSectionGroup';
import { CommandMenuItemSwitch } from '@/command-menu/components/CommandMenuItemSwitch';
import { CORE_AGENT_RECORD_ACCESS_LEVELS } from '@/object-core/agents/constants/CoreAgentRecordAccessLevels';
import { type CoreAgentRecordAccessLevel } from '@/object-core/agents/types/CoreAgentRecordAccessLevel';
import { getCoreAgentRecordAccessLevels } from '@/object-core/agents/utils/getCoreAgentRecordAccessLevels';
import { type RoleWithPartialMembers } from '@/settings/roles/types/RoleWithPartialMembers';
import { SETTINGS_ROLE_OBJECT_PERMISSION_ICON_CONFIG } from '@/settings/roles/role-permissions/objects-permissions/constants/SettingsRoleObjectPermissionIconConfig';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';

type SidePanelCoreAgentRecordAccessGroupProps = {
  heading: string;
  Icon?: IconComponent;
  icon?: ReactNode;
  role: RoleWithPartialMembers | undefined;
  objectMetadataId?: string;
  isReadOnly: boolean;
  onLevelChange: (
    level: CoreAgentRecordAccessLevel,
    isEnabled: boolean,
  ) => void;
};

export const SidePanelCoreAgentRecordAccessGroup = ({
  heading,
  Icon,
  icon,
  role,
  objectMetadataId,
  isReadOnly,
  onLevelChange,
}: SidePanelCoreAgentRecordAccessGroupProps) => {
  const { t } = useLingui();

  const enabledLevels = getCoreAgentRecordAccessLevels({
    role,
    objectMetadataId,
  });

  return (
    <CommandMenuItemSectionGroup
      heading={heading}
      Icon={Icon}
      context={isDefined(icon) ? { icon } : undefined}
    >
      {CORE_AGENT_RECORD_ACCESS_LEVELS.map(
        ({ level, label, allRecordsLabel, objectKey }) => {
          const itemId = `${objectMetadataId ?? 'all-records'}-${level}`;
          const isEnabled = enabledLevels.includes(level);

          return (
            <SelectableListItem
              key={itemId}
              itemId={itemId}
              onEnter={() => {
                if (!isReadOnly) {
                  onLevelChange(level, !isEnabled);
                }
              }}
            >
              <CommandMenuItemSwitch
                id={itemId}
                LeftIcon={
                  SETTINGS_ROLE_OBJECT_PERMISSION_ICON_CONFIG[objectKey].Icon
                }
                text={t(isDefined(objectMetadataId) ? label : allRecordsLabel)}
                checked={isEnabled}
                onCheckedChange={(isChecked) => onLevelChange(level, isChecked)}
                disabled={isReadOnly}
              />
            </SelectableListItem>
          );
        },
      )}
    </CommandMenuItemSectionGroup>
  );
};
