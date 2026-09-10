import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useSortedArray } from '@/ui/layout/table/hooks/useSortedArray';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useMemo, useState } from 'react';
import { IconArchive } from 'twenty-ui/icon';
import { H2Title } from 'twenty-ui/typography';
import { SearchInput } from 'twenty-ui/input';
import { MenuItemSwitch } from 'twenty-ui/navigation';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { useMutation, useQuery } from '@apollo/client/react';
import { Section } from 'twenty-ui/layout';
import {
  ActivateSkillDocument,
  DeleteSkillDocument,
  FindManySkillsDocument,
} from '~/generated-metadata/graphql';
import { SETTINGS_SKILL_TABLE_METADATA } from '~/pages/settings/ai/constants/SettingsSkillTableMetadata';
import { type SettingsSkillTableItem } from '~/pages/settings/ai/types/SettingsSkillTableItem';
import { normalizeSearchText } from '~/utils/normalizeSearchText';
import { SettingsAgentSkillsTable } from './SettingsAgentSkillsTable';

const StyledSearchContainer = styled.div`
  padding-bottom: ${themeCssVariables.spacing[2]};
`;

export const SettingsAgentSkillsTab = () => {
  const { t } = useLingui();
  const { enqueueSuccessSnackBar, enqueueErrorSnackBar } = useSnackBar();

  const { data, loading, refetch } = useQuery(FindManySkillsDocument);
  const [activateSkill] = useMutation(ActivateSkillDocument);
  const [deleteSkill] = useMutation(DeleteSkillDocument);

  const [searchTerm, setSearchTerm] = useState('');
  const [showDeactivated, setShowDeactivated] = useState(true);

  const currentWorkspace = useAtomStateValue(currentWorkspaceState);
  const installedApplications = currentWorkspace?.installedApplications;

  const skillTableItems = useMemo(
    () =>
      (data?.skills ?? []).map(
        (skill) =>
          ({
            ...skill,
            applicationLabel:
              installedApplications?.find(
                (application) => application.id === skill.applicationId,
              )?.name ?? '',
          }) satisfies SettingsSkillTableItem,
      ),
    [data?.skills, installedApplications],
  );

  const sortedSkills = useSortedArray(
    skillTableItems,
    SETTINGS_SKILL_TABLE_METADATA,
  );

  const filteredSkills = useMemo(
    () =>
      sortedSkills.filter((skill) => {
        const searchNormalized = normalizeSearchText(searchTerm);
        const matchesSearch =
          normalizeSearchText(skill.name).includes(searchNormalized) ||
          normalizeSearchText(skill.label).includes(searchNormalized) ||
          normalizeSearchText(skill.applicationLabel).includes(
            searchNormalized,
          );

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
    <Section>
      <H2Title
        title={t`Skills`}
        description={t`Use filter to see existing skills or create your own`}
      />

      <StyledSearchContainer>
        <SearchInput
          placeholder={t`Search a skill...`}
          value={searchTerm}
          onChange={setSearchTerm}
          filterDropdown={(filterButton) => (
            <Dropdown
              dropdownId="settings-skills-filter-dropdown"
              dropdownPlacement="bottom-end"
              dropdownOffset={{ x: 0, y: 8 }}
              clickableComponent={filterButton}
              dropdownComponents={
                <DropdownContent>
                  <DropdownMenuItemsContainer>
                    <MenuItemSwitch
                      LeftIcon={IconArchive}
                      onCheckedChange={setShowDeactivated}
                      checked={showDeactivated}
                      text={t`Deactivated`}
                      size="sm"
                    />
                  </DropdownMenuItemsContainer>
                </DropdownContent>
              }
            />
          )}
        />
      </StyledSearchContainer>
      <SettingsAgentSkillsTable
        skills={filteredSkills}
        loading={loading}
        onActivate={handleActivate}
        onDelete={handleDelete}
      />
    </Section>
  );
};
