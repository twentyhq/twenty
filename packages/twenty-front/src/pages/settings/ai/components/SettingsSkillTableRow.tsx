import { styled } from '@linaria/react';
import { type ReactNode, useContext } from 'react';

import { SettingsItemTypeTag } from '@/settings/components/SettingsItemTypeTag';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { useIcons, OverflowingTextWithTooltip } from 'twenty-ui/display';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';

import { type Skill } from '~/generated-metadata/graphql';

export type SettingsSkillTableRowProps = {
  skill: Skill;
  action?: ReactNode;
  link?: string;
};

const StyledIconContainer = styled.div`
  align-items: center;
  display: flex;
  flex-shrink: 0;
`;

export const SettingsSkillTableRow = ({
  skill,
  action,
  link,
}: SettingsSkillTableRowProps) => {
  const { theme } = useContext(ThemeContext);
  const { getIcon } = useIcons();
  const Icon = getIcon(skill.icon ?? 'IconSparkles');

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
        <StyledIconContainer>
          <Icon size={theme.icon.size.md} />
        </StyledIconContainer>
        <OverflowingTextWithTooltip text={skill.label} />
      </TableCell>
      <TableCell>
        <SettingsItemTypeTag item={skill} />
      </TableCell>
      <TableCell align="right">{action}</TableCell>
    </TableRow>
  );
};
