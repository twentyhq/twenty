import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import Skeleton from 'react-loading-skeleton';

import { SettingsTextInput } from '@/ui/input/components/SettingsTextInput';
import { SortableTableHeader } from '@/ui/layout/table/components/SortableTableHeader';
import { Table } from '@/ui/layout/table/components/Table';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { useSortedArray } from '@/ui/layout/table/hooks/useSortedArray';
import { useTheme } from '@emotion/react';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import {
  H2Title,
  IconChevronRight,
  IconPlus,
  IconSearch,
} from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import { Section } from 'twenty-ui/layout';
import { UndecoratedLink } from 'twenty-ui/navigation';

import { useFindManySkillsQuery } from '~/generated-metadata/graphql';
import { SETTINGS_SKILL_TABLE_METADATA } from '~/pages/settings/ai/constants/SettingsSkillTableMetadata';
import { normalizeSearchText } from '~/utils/normalizeSearchText';
import {
  SettingsSkillTableRow,
  StyledSkillTableRow,
} from './SettingsSkillTableRow';

const StyledSearchContainer = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  margin-bottom: ${({ theme }) => theme.spacing(2)};
  width: 100%;
`;

const StyledSearchInput = styled(SettingsTextInput)`
  flex: 1;
`;

const StyledTable = styled(Table)`
  margin-top: ${({ theme }) => theme.spacing(3)};
`;

const StyledTableHeaderRow = styled(StyledSkillTableRow)`
  margin-bottom: ${({ theme }) => theme.spacing(2)};
`;

const StyledHeaderContainer = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
`;

export const SettingsSkillsTable = () => {
  const { data, loading } = useFindManySkillsQuery();

  const { t } = useLingui();
  const theme = useTheme();
  const [searchTerm, setSearchTerm] = useState('');

  const skills = data?.skills ?? [];

  const sortedSkills = useSortedArray(skills, SETTINGS_SKILL_TABLE_METADATA);

  const filteredSkills = sortedSkills.filter((skill) => {
    const searchNormalized = normalizeSearchText(searchTerm);
    const matchesSearch =
      normalizeSearchText(skill.name).includes(searchNormalized) ||
      normalizeSearchText(skill.label).includes(searchNormalized);

    return matchesSearch;
  });

  const showSkeleton = loading && skills.length === 0;

  return (
    <Section>
      <StyledHeaderContainer>
        <H2Title
          title={t`Skills`}
          description={t`Skills available in the chat`}
        />
        <UndecoratedLink to={getSettingsPath(SettingsPath.AINewSkill)}>
          <Button
            Icon={IconPlus}
            title={t`New Skill`}
            size="small"
            variant="secondary"
          />
        </UndecoratedLink>
      </StyledHeaderContainer>

      <StyledSearchContainer>
        <StyledSearchInput
          instanceId="skill-table-search"
          LeftIcon={IconSearch}
          placeholder={t`Search a skill...`}
          value={searchTerm}
          onChange={setSearchTerm}
        />
      </StyledSearchContainer>

      <StyledTable>
        <StyledTableHeaderRow>
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
        </StyledTableHeaderRow>
        {showSkeleton
          ? Array.from({ length: 3 }).map((_, index) => (
              <Skeleton height={32} borderRadius={4} key={index} />
            ))
          : filteredSkills.map((skill) => (
              <SettingsSkillTableRow
                key={skill.id}
                skill={skill}
                action={
                  <IconChevronRight
                    size={theme.icon.size.md}
                    stroke={theme.icon.stroke.sm}
                  />
                }
                link={getSettingsPath(SettingsPath.AISkillDetail, {
                  skillId: skill.id,
                })}
              />
            ))}
      </StyledTable>
    </Section>
  );
};
