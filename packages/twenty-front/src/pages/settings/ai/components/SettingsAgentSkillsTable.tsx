import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useContext } from 'react';
import Skeleton from 'react-loading-skeleton';

import { SortableTableHeader } from '@/ui/layout/table/components/SortableTableHeader';
import { Table } from '@/ui/layout/table/components/Table';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import { IconChevronRight } from 'twenty-ui/display';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';

import { type FindManySkillsQuery } from '~/generated-metadata/graphql';
import { SettingsSkillInactiveMenuDropDown } from '~/pages/settings/ai/components/SettingsSkillInactiveMenuDropDown';
import { SETTINGS_SKILL_TABLE_METADATA } from '~/pages/settings/ai/constants/SettingsSkillTableMetadata';
import { SettingsSkillTableRow } from './SettingsSkillTableRow';

type Skill = FindManySkillsQuery['skills'][number];

type SettingsAgentSkillsTableProps = {
  skills: Skill[];
  loading: boolean;
  onActivate: (skillId: string) => void;
  onDelete: (skillId: string) => void;
};

const StyledTableHeaderRowContainer = styled.div`
  margin-bottom: ${themeCssVariables.spacing[2]};
`;

export const SettingsAgentSkillsTable = ({
  skills,
  loading,
  onActivate,
  onDelete,
}: SettingsAgentSkillsTableProps) => {
  const { theme } = useContext(ThemeContext);
  const { t } = useLingui();

  const showSkeleton = loading && skills.length === 0;

  return (
    <Table>
      <StyledTableHeaderRowContainer>
        <TableRow gridTemplateColumns="1fr 120px 36px">
          {SETTINGS_SKILL_TABLE_METADATA.fields.map(
            (settingsSkillTableMetadataField) => (
              <SortableTableHeader
                key={settingsSkillTableMetadataField.fieldName}
                fieldName={settingsSkillTableMetadataField.fieldName}
                label={t(settingsSkillTableMetadataField.fieldLabel)}
                tableId={SETTINGS_SKILL_TABLE_METADATA.tableId}
                align={settingsSkillTableMetadataField.align}
                initialSort={SETTINGS_SKILL_TABLE_METADATA.initialSort}
              />
            ),
          )}
          <TableHeader />
        </TableRow>
      </StyledTableHeaderRowContainer>
      {showSkeleton
        ? Array.from({ length: 3 }).map((_, index) => (
            <Skeleton height={32} borderRadius={4} key={index} />
          ))
        : skills.map((skill) => (
            <SettingsSkillTableRow
              key={skill.id}
              skill={skill}
              action={
                skill.isActive ? (
                  <IconChevronRight
                    size={theme.icon.size.md}
                    stroke={theme.icon.stroke.sm}
                  />
                ) : (
                  <SettingsSkillInactiveMenuDropDown
                    isCustomSkill={skill.isCustom}
                    skillId={skill.id}
                    onActivate={() => onActivate(skill.id)}
                    onDelete={() => onDelete(skill.id)}
                  />
                )
              }
              link={
                skill.isActive
                  ? getSettingsPath(SettingsPath.AiSkillDetail, {
                      skillId: skill.id,
                    })
                  : undefined
              }
            />
          ))}
    </Table>
  );
};
