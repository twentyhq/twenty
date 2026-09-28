import { useQuery } from '@apollo/client/react';
import { useLingui } from '@lingui/react/macro';
import { type Editor } from '@tiptap/react';
import { useState } from 'react';
import { SettingsPath } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { Dropdown } from 'twenty-ui/components';
import { IconPlus, useIcons } from 'twenty-ui/icon';

import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { DEFAULT_SKILL_ICON } from '@/skill-suggestion/constants/DefaultSkillIcon';
import { type SkillSuggestionItem } from '@/skill-suggestion/types/SkillSuggestionItem';
import { getSkillSuggestionItems } from '@/skill-suggestion/utils/getSkillSuggestionItems';
import { getSkillTagContent } from '@/skill-suggestion/utils/getSkillTagContent';
import {
  FindManySkillsForSuggestionDocument,
  PermissionFlagType,
} from '~/generated-metadata/graphql';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';

type AiChatAddMenuSkillsPageProps = {
  editor: Editor | null;
};

export const AiChatAddMenuSkillsPage = ({
  editor,
}: AiChatAddMenuSkillsPageProps) => {
  const { t } = useLingui();
  const { getIcon } = useIcons();
  const navigateSettings = useNavigateSettings();
  const hasAiSettingsPermission = useHasPermissionFlag(
    PermissionFlagType.AI_SETTINGS,
  );
  const [search, setSearch] = useState('');

  const { data, loading } = useQuery(FindManySkillsForSuggestionDocument, {
    fetchPolicy: 'cache-and-network',
  });

  const skills = getSkillSuggestionItems({
    skills: data?.skills ?? [],
    query: search,
  });

  const handleSkillSelect = (skill: SkillSuggestionItem) => {
    if (!isDefined(editor)) {
      return;
    }

    editor.commands.insertContent(getSkillTagContent(skill));
    editor.view.focus();
  };

  return (
    <>
      <Dropdown.Back>{t`Skills`}</Dropdown.Back>
      <Dropdown.Search
        aria-label={t`Search skills`}
        placeholder={t`Search skills`}
        value={search}
        onValueChange={setSearch}
      />
      <Dropdown.Separator />
      <Dropdown.Section scrollable>
        {skills.map((skill) => {
          const SkillIcon = getIcon(skill.icon ?? DEFAULT_SKILL_ICON);

          return (
            <Dropdown.OptionItem
              key={skill.id}
              selected={false}
              indicator="none"
              startIcon={<SkillIcon />}
              onSelect={() => handleSkillSelect(skill)}
            >
              {skill.label}
            </Dropdown.OptionItem>
          );
        })}
        {skills.length === 0 &&
          (loading ? (
            <Dropdown.Loading>{t`Loading skills`}</Dropdown.Loading>
          ) : (
            <Dropdown.Empty>{t`No skills found`}</Dropdown.Empty>
          ))}
      </Dropdown.Section>
      {hasAiSettingsPermission && (
        <>
          <Dropdown.Separator />
          <Dropdown.Section>
            <Dropdown.ActionItem
              startIcon={<IconPlus />}
              onClick={() => navigateSettings(SettingsPath.AiNewSkill)}
            >
              {t`New skill`}
            </Dropdown.ActionItem>
          </Dropdown.Section>
        </>
      )}
    </>
  );
};
