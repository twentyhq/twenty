import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { type IconComponent } from 'twenty-ui/icon';

import { CommandMenuItemSectionGroup } from '@/command-menu-item/display/components/CommandMenuItemSectionGroup';
import { CommandMenuItemSwitch } from '@/command-menu/components/CommandMenuItemSwitch';
import { CORE_AGENT_RECORD_ACCESS_LEVELS } from '@/object-core/agents/constants/CoreAgentRecordAccessLevels';
import { type CoreAgentRecordAccessLevel } from '@/object-core/agents/types/CoreAgentRecordAccessLevel';
import { getCoreAgentRecordAccessItemId } from '@/object-core/agents/utils/getCoreAgentRecordAccessItemId';
import { getCoreAgentRecordAccessLevels } from '@/object-core/agents/utils/getCoreAgentRecordAccessLevels';
import { ObjectMetadataIcon } from '@/object-metadata/components/ObjectMetadataIcon';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { useObjectDisabledOperations } from '@/settings/roles/role-permissions/object-overrides/hooks/useObjectDisabledOperations';
import { type RoleWithPartialMembers } from '@/settings/roles/types/RoleWithPartialMembers';
import { SETTINGS_ROLE_OBJECT_PERMISSION_ICON_CONFIG } from '@/settings/roles/role-permissions/object-overrides/constants/SettingsRoleObjectPermissionIconConfig';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';

type SidePanelCoreAgentRecordAccessSectionProps = {
  heading: string;
  Icon?: IconComponent;
  objectMetadataItem?: EnrichedObjectMetadataItem;
  role: RoleWithPartialMembers | undefined;
  isReadOnly: boolean;
  onLevelChange: ({
    level,
    isEnabled,
  }: {
    level: CoreAgentRecordAccessLevel;
    isEnabled: boolean;
  }) => void;
};

export const SidePanelCoreAgentRecordAccessSection = ({
  heading,
  Icon,
  objectMetadataItem,
  role,
  isReadOnly,
  onLevelChange,
}: SidePanelCoreAgentRecordAccessSectionProps) => {
  const { t } = useLingui();
  const { disabledOperations, disabledOperationReasons } =
    useObjectDisabledOperations(objectMetadataItem);

  const objectMetadataId = objectMetadataItem?.id;

  const enabledLevels = getCoreAgentRecordAccessLevels({
    role,
    objectMetadataId,
    disabledOperations,
  });

  return (
    <CommandMenuItemSectionGroup
      heading={heading}
      Icon={Icon}
      context={
        isDefined(objectMetadataItem)
          ? {
              icon: (
                <ObjectMetadataIcon objectMetadataItem={objectMetadataItem} />
              ),
            }
          : undefined
      }
    >
      {CORE_AGENT_RECORD_ACCESS_LEVELS.map(
        ({ level, label, allRecordsLabel, objectKey }) => {
          const itemId = getCoreAgentRecordAccessItemId({
            objectMetadataId,
            level,
          });
          const isEnabled = enabledLevels.includes(level);
          const disabledReason = disabledOperationReasons[objectKey];
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
