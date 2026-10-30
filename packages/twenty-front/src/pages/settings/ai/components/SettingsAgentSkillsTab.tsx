import { getApplicationDisplayName } from '@/applications/utils/getApplicationDisplayName';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { useSortedArray } from '@/ui/layout/table/hooks/useSortedArray';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useMutation, useQuery } from '@apollo/client/react';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useMemo, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { useToast } from 'twenty-ui/components/feedback';
import { SearchInput } from 'twenty-ui/components/input';
import { Section } from 'twenty-ui/components/layout';
import { Dropdown } from 'twenty-ui/components/navigation';
import { SettingsRow } from 'twenty-ui/components/settings';
import { IconArchive, IconSettings } from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme';
import {
  ActivateSkillDocument,
  DeleteSkillDocument,
  FindManySkillsDocument,
} from '~/generated-metadata/graphql';
import { SETTINGS_SKILL_TABLE_METADATA } from '~/pages/settings/ai/constants/SettingsSkillTableMetadata';
import { type SettingsSkillTableItem } from '~/pages/settings/ai/types/SettingsSkillTableItem';
import { SettingsAgentSkillsTable } from './SettingsAgentSkillsTable';
import { normalizeSearchText } from 'twenty-ui/utilities';
import { SettingsSearchFilterTrigger } from '@/settings/components/SettingsSearchFilterTrigger';

const StyledSearchContainer = styled.div`
  padding-bottom: ${themeCssVariables.spacing[2]};
`;

export const SettingsAgentSkillsTab = () => {
  const { t } = useLingui();
  const { enqueueToast } = useToast();

  const { data, loading, refetch } = useQuery(FindManySkillsDocument);
  const [activateSkill] = useMutation(ActivateSkillDocument);
  const [deleteSkill] = useMutation(DeleteSkillDocument);

  const [searchTerm, setSearchTerm] = useState('');
  const [showDeactivated, setShowDeactivated] = useState(true);
  const [showSystemSkills, setShowSystemSkills] = useState(false);

  const currentWorkspace = useAtomStateValue(currentWorkspaceState);
  const installedApplications = currentWorkspace?.installedApplications;

  // not memoized: the label is translated, so a cached one would survive a locale change
  const skillTableItems = (data?.skills ?? []).map((skill) => {
    const application = installedApplications?.find(
      (installedApplication) => installedApplication.id === skill.applicationId,
    );

    return {
      ...skill,
      applicationLabel: isDefined(application)
        ? getApplicationDisplayName({ application, currentWorkspace })
        : '',
    } satisfies SettingsSkillTableItem;
  });

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

        if (skill.isSystem && !showSystemSkills) {
          return false;
        }

        return true;
      }),
    [sortedSkills, searchTerm, showDeactivated, showSystemSkills],
  );

  const handleActivate = async (skillId: string) => {
    try {
      await activateSkill({ variables: { id: skillId } });
      enqueueToast({ status: 'success', children: t`Skill activated` });
      refetch();
    } catch {
      enqueueToast({ status: 'error', children: t`Failed to activate skill` });
    }
  };

  const handleDelete = async (skillId: string) => {
    try {
      await deleteSkill({ variables: { id: skillId } });
      enqueueToast({ status: 'success', children: t`Skill deleted` });
      refetch();
    } catch {
      enqueueToast({ status: 'error', children: t`Failed to delete skill` });
    }
  };

  return (
    <Section.Root>
      <Section.Header
        title={t`Skills`}
        description={t`Use filter to see existing skills or create your own`}
      />

      <StyledSearchContainer>
        <SearchInput
          placeholder={t`Search a skill...`}
          value={searchTerm}
          onValueChange={setSearchTerm}
          actions={
            <DropdownRoot
              dropdownId="settings-skills-filter-dropdown"
              type="panel"
            >
              <SettingsSearchFilterTrigger />
              <DropdownContent
                side="bottom"
                align="end"
                sideOffset={8}
                alignOffset={0}
              >
                <Dropdown.Section>
                  <SettingsRow
                    startElement={<IconArchive />}
                    onCheckedChange={setShowDeactivated}
                    checked={showDeactivated}
                  >{t`Deactivated`}</SettingsRow>
                  <SettingsRow
                    startElement={<IconSettings />}
                    onCheckedChange={setShowSystemSkills}
                    checked={showSystemSkills}
                  >{t`System skills`}</SettingsRow>
                </Dropdown.Section>
              </DropdownContent>
            </DropdownRoot>
          }
        />
      </StyledSearchContainer>
      <SettingsAgentSkillsTable
        skills={filteredSkills}
        loading={loading}
        onActivate={handleActivate}
        onDelete={handleDelete}
      />
    </Section.Root>
  );
};
