import { t } from '@lingui/core/macro';
import { Dropdown, LightIconButton } from 'twenty-ui/components';
import { IconArchiveOff, IconDotsVertical, IconTrash } from 'twenty-ui/icon';

import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';

const INACTIVE_SKILL_MENU_WIDTH = 160;

type SettingsSkillInactiveMenuDropDownProps = {
  isCustomSkill: boolean;
  skillId: string;
  onActivate: () => void;
  onDelete: () => void;
};

export const SettingsSkillInactiveMenuDropDown = ({
  skillId,
  onActivate,
  onDelete,
  isCustomSkill,
}: SettingsSkillInactiveMenuDropDownProps) => (
  <DropdownRoot
    type="menu"
    dropdownId={`${skillId}-settings-skill-inactive-menu-dropdown`}
  >
    <Dropdown.Trigger
      render={
        <LightIconButton
          aria-label={t`Inactive Skill Options`}
          emphasis="subtle"
        >
          <IconDotsVertical />
        </LightIconButton>
      }
    />
    <Dropdown.Content align="end" width={INACTIVE_SKILL_MENU_WIDTH}>
      <Dropdown.Section>
        <Dropdown.ActionItem
          startIcon={<IconArchiveOff />}
          onClick={onActivate}
        >{t`Activate`}</Dropdown.ActionItem>
        {isCustomSkill && (
          <Dropdown.ActionItem
            startIcon={<IconTrash />}
            color="danger"
            onClick={onDelete}
          >{t`Delete`}</Dropdown.ActionItem>
        )}
      </Dropdown.Section>
    </Dropdown.Content>
  </DropdownRoot>
);
