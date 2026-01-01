import styled from '@emotion/styled';
import { type ReactNode } from 'react';

import { SettingsItemTypeTag } from '@/settings/components/SettingsItemTypeTag';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { useIcons, OverflowingTextWithTooltip } from 'twenty-ui/display';

import { type Skill } from '~/generated-metadata/graphql';

export type SettingsSkillTableRowProps = {
  skill: Skill;
  action?: ReactNode;
  link?: string;
};

export const StyledSkillTableRow = styled(TableRow)`
  grid-template-columns: 1fr 120px 36px;
`;

const StyledNameTableCell = styled(TableCell)`
  color: ${({ theme }) => theme.font.color.primary};
  gap: ${({ theme }) => theme.spacing(2)};
  min-width: 0;
  overflow: hidden;
`;

const StyledIconContainer = styled.div`
  align-items: center;
  display: flex;
  flex-shrink: 0;
`;

const StyledActionTableCell = styled(TableCell)`
  justify-content: flex-end;
  padding-right: ${({ theme }) => theme.spacing(2)};
`;

export const SettingsSkillTableRow = ({
  skill,
  action,
  link,
}: SettingsSkillTableRowProps) => {
  const { getIcon } = useIcons();
  const Icon = getIcon(skill.icon ?? 'IconSparkles');

  return (
    <StyledSkillTableRow key={skill.id} to={link}>
      <StyledNameTableCell>
        <StyledIconContainer>
          <Icon size={16} />
        </StyledIconContainer>
        <OverflowingTextWithTooltip text={skill.label} />
      </StyledNameTableCell>
      <TableCell>
        <SettingsItemTypeTag item={skill} />
      </TableCell>
      <StyledActionTableCell>{action}</StyledActionTableCell>
    </StyledSkillTableRow>
  );
};
