import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { useMemo, useState } from 'react';
import Skeleton from 'react-loading-skeleton';

import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { SettingsTextInput } from '@/ui/input/components/SettingsTextInput';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { SortableTableHeader } from '@/ui/layout/table/components/SortableTableHeader';
import { Table } from '@/ui/layout/table/components/Table';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { useSortedArray } from '@/ui/layout/table/hooks/useSortedArray';
import { useTheme } from '@emotion/react';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import {
  IconArchive,
  IconChevronRight,
  IconFilter,
  IconPlus,
  IconSearch,
} from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import { MenuItemToggle, UndecoratedLink } from 'twenty-ui/navigation';

import {
  useActivateSkillMutation,
  useDeleteSkillMutation,
  useFindManySkillsQuery,
} from '~/generated-metadata/graphql';
import { SettingsSkillInactiveMenuDropDown } from '~/pages/settings/ai/components/SettingsSkillInactiveMenuDropDown';
import { SETTINGS_SKILL_TABLE_METADATA } from '~/pages/settings/ai/constants/SettingsSkillTableMetadata';
import { normalizeSearchText } from '~/utils/normalizeSearchText';
import {
  SettingsSkillTableRow,
  StyledSkillTableRow,
} from './SettingsSkillTableRow';

const StyledSearchAndFilterContainer = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  align-items: center;
  padding-bottom: ${({ theme }) => theme.spacing(2)};
`;

const StyledSearchInput = styled(SettingsTextInput)`
  flex: 1;
  width: 100%;
`;

const StyledTableHeaderRow = styled(StyledSkillTableRow)`
  margin-bottom: ${({ theme }) => theme.spacing(2)};
`;

const StyledFooterContainer = styled.div`
  align-items: center;
  display: flex;
  justify-content: flex-end;
  margin-top: ${({ theme }) => theme.spacing(4)};
`;

export const SettingsSkillsTable = () => {
  const { data, loading, refetch } = useFindManySkillsQuery();
  const [activateSkill] = useActivateSkillMutation();
  const [deleteSkill] = useDeleteSkillMutation();

  const { t } = useLingui();
  const theme = useTheme();
  const { enqueueSuccessSnackBar, enqueueErrorSnackBar } = useSnackBar();
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeactivated, setShowDeactivated] = useState(true);

  const skills = data?.skills ?? [];

  const sortedSkills = useSortedArray(skills, SETTINGS_SKILL_TABLE_METADATA);

  const filteredSkills = useMemo(
    () =>
      sortedSkills.filter((skill) => {
        const searchNormalized = normalizeSearchText(searchTerm);
        const matchesSearch =
          normalizeSearchText(skill.name).includes(searchNormalized) ||
          normalizeSearchText(skill.label).includes(searchNormalized);

        if (!matchesSearch) {
          return false;
        }

        if (!skill.isActive && !showDeactivated) {
          return false;
        }

        return true;
      }),
    [sortedSkills, searchTerm, showDeactivated],
  );

  const showSkeleton = loading && skills.length === 0;

  const handleActivate = async (skillId: string) => {
    try {
      await activateSkill({ variables: { id: skillId } });
      enqueueSuccessSnackBar({ message: t`Skill activated` });
      refetch();
    } catch {
      enqueueErrorSnackBar({ message: t`Failed to activate skill` });
    }
  };

  const handleDelete = async (skillId: string) => {
    try {
      await deleteSkill({ variables: { id: skillId } });
      enqueueSuccessSnackBar({ message: t`Skill deleted` });
      refetch();
    } catch {
      enqueueErrorSnackBar({ message: t`Failed to delete skill` });
    }
  };

  return (
    <>
      <StyledSearchAndFilterContainer>
        <StyledSearchInput
          instanceId="skill-table-search"
          LeftIcon={IconSearch}
          placeholder={t`Search a skill...`}
          value={searchTerm}
          onChange={setSearchTerm}
        />
        <Dropdown
          dropdownId="settings-skills-filter-dropdown"
          dropdownPlacement="bottom-end"
          dropdownOffset={{ x: 0, y: 8 }}
          clickableComponent={
            <Button
              Icon={IconFilter}
              size="medium"
              variant="secondary"
              accent="default"
              ariaLabel={t`Filter`}
            />
          }
          dropdownComponents={
            <DropdownContent>
              <DropdownMenuItemsContainer>
                <MenuItemToggle
                  LeftIcon={IconArchive}
                  onToggleChange={() => setShowDeactivated(!showDeactivated)}
                  toggled={showDeactivated}
                  text={t`Deactivated`}
                  toggleSize="small"
                />
              </DropdownMenuItemsContainer>
            </DropdownContent>
          }
        />
      </StyledSearchAndFilterContainer>

      <Table>
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
                  skill.isActive ? (
                    <IconChevronRight
                      size={theme.icon.size.md}
                      stroke={theme.icon.stroke.sm}
                    />
                  ) : (
                    <SettingsSkillInactiveMenuDropDown
                      isCustomSkill={skill.isCustom}
                      skillId={skill.id}
                      onActivate={() => handleActivate(skill.id)}
                      onDelete={() => handleDelete(skill.id)}
                    />
                  )
                }
                link={
                  skill.isActive
                    ? getSettingsPath(SettingsPath.AISkillDetail, {
                        skillId: skill.id,
                      })
                    : undefined
                }
              />
            ))}
      </Table>

      <StyledFooterContainer>
        <UndecoratedLink to={getSettingsPath(SettingsPath.AINewSkill)}>
          <Button
            Icon={IconPlus}
            title={t`New Skill`}
            size="small"
            variant="secondary"
          />
        </UndecoratedLink>
      </StyledFooterContainer>
    </>
  );
};
