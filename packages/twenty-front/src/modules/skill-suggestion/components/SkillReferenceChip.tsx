import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import { LinkChip } from 'twenty-ui/data-display';
import { useIcons } from 'twenty-ui/icon';
import { useTheme } from 'twenty-ui/theme-constants';

import { DEFAULT_SKILL_ICON } from '@/skill-suggestion/constants/DefaultSkillIcon';

type SkillReferenceChipProps = {
  skillId: string;
  label: string;
  icon: string | null;
};

export const SkillReferenceChip = ({
  skillId,
  label,
  icon,
}: SkillReferenceChipProps) => {
  const theme = useTheme();
  const { getIcon } = useIcons();
  const Icon = getIcon(icon ?? DEFAULT_SKILL_ICON);

  return (
    <LinkChip
      to={getSettingsPath(SettingsPath.AiSkillDetail, { skillId })}
      variant="soft"
      startElement={
        <Icon size={theme.icon.size.sm} stroke={theme.icon.stroke.sm} />
      }
    >
      {label}
    </LinkChip>
  );
};
