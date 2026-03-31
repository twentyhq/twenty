import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useSortedArray } from '@/ui/layout/table/hooks/useSortedArray';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useContext, useMemo, useState } from 'react';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import { H2Title, IconArchive, IconPlus } from 'twenty-ui/display';
import { Button, SearchInput } from 'twenty-ui/input';
import { MenuItemToggle, UndecoratedLink } from 'twenty-ui/navigation';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';

import { useMutation, useQuery } from '@apollo/client/react';
import { Section } from 'twenty-ui/layout';
import {
  ActivateSkillDocument,
  DeleteSkillDocument,
  FindManySkillsDocument,
} from '~/generated-metadata/graphql';
import { SETTINGS_SKILL_TABLE_METADATA } from '~/pages/settings/ai/constants/SettingsSkillTableMetadata';
import { normalizeSearchText } from '~/utils/normalizeSearchText';
import { SettingsAgentSkillsTable } from './SettingsAgentSkillsTable';

const StyledCoverImage = styled.div`
  background-position: center;
  background-size: cover;
  height: 160px;
  overflow: hidden;
`;

const StyledFooterContainer = styled.div`
  align-items: center;
  display: flex;
  justify-content: flex-end;
  margin-top: ${themeCssVariables.spacing[4]};
`;

const StyledSearchInput = styled(SearchInput)`
  margin-bottom: ${themeCssVariables.spacing[4]};
`;

export const SettingsAgentSkills = () => {
  const { t } = useLingui();
  const { colorScheme } = useContext(ThemeContext);
  const { enqueueSuccessSnackBar, enqueueErrorSnackBar } = useSnackBar();

  const { data, loading, refetch } = useQuery(FindManySkillsDocument);
  const [activateSkill] = useMutation(ActivateSkillDocument);
  const [deleteSkill] = useMutation(DeleteSkillDocument);

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

  const coverImage =
    colorScheme === 'light'
      ? '/images/ai/ai-skills-cover-light.png'
      : '/images/ai/ai-skills-cover-dark.png';

  return (
    <>
      <StyledCoverImage style={{ backgroundImage: `url('${coverImage}')` }} />
      <Section>
        <H2Title
          title={t`Skills`}
          description={t`Use filter to see existing tools or create your own`}
        />

        <StyledSearchInput
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
                    <MenuItemToggle
                      LeftIcon={IconArchive}
                      onToggleChange={() =>
                        setShowDeactivated(!showDeactivated)
                      }
                      toggled={showDeactivated}
                      text={t`Deactivated`}
                      toggleSize="small"
                    />
                  </DropdownMenuItemsContainer>
                </DropdownContent>
              }
            />
          )}
        />
        <SettingsAgentSkillsTable
          skills={filteredSkills}
          loading={loading}
          onActivate={handleActivate}
          onDelete={handleDelete}
        />
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
      </Section>
    </>
  );
};
