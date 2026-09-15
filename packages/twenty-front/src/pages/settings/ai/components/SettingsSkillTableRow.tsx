import { SettingsTableFirstColumn } from '@/settings/components/SettingsTableFirstColumn';
import { type ReactNode, useContext } from 'react';

import { SettingsItemTypeTag } from '@/settings/components/SettingsItemTypeTag';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { useIcons } from 'twenty-ui/icon';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';

import { type Skill } from '~/generated-metadata/graphql';

export type SettingsSkillTableRowProps = {
  skill: Skill;
  action?: ReactNode;
  link?: string;
};

export const SettingsSkillTableRow = ({
  skill,
  action,
  link,
}: SettingsSkillTableRowProps) => {
  const { theme } = useContext(ThemeContext);
  const { getIcon } = useIcons();
  const Icon = getIcon(skill.icon ?? 'IconBook');

  return (
    <TableRow
      key={skill.id}
      to={link}
      gridTemplateColumns="1fr 120px 36px"
      style={{ opacity: skill.isActive ? 1 : 0.5 }}
    >
      <TableCell
        color={themeCssVariables.font.color.primary}
        gap={themeCssVariables.spacing[2]}
        minWidth="0"
        overflow="hidden"
      >
        <SettingsTableFirstColumn
          label={skill.label}
          leadingContent={
            <Icon size={theme.icon.size.md} color={theme.color.blue9} />
          }
        />
      </TableCell>
      <TableCell>
        <SettingsItemTypeTag item={skill} />
      </TableCell>
      <TableCell align="right">{action}</TableCell>
    </TableRow>
  );
};
