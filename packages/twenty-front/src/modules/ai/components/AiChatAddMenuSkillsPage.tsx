import { useQuery } from '@apollo/client/react';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { type Editor } from '@tiptap/react';
import { useId, useState } from 'react';
import { SettingsPath } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { Dropdown } from 'twenty-ui/components';
import { IconPlus, useIcons } from 'twenty-ui/icon';
import { useIsMobile } from 'twenty-ui/utilities';

import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { SkillSuggestionPreviewCard } from '@/skill-suggestion/components/SkillSuggestionPreviewCard';
import { DEFAULT_SKILL_ICON } from '@/skill-suggestion/constants/DefaultSkillIcon';
import { SKILL_SUGGESTION_PREVIEW_WIDTH } from '@/skill-suggestion/constants/SkillSuggestionPreviewWidth';
import { type SkillSuggestionItem } from '@/skill-suggestion/types/SkillSuggestionItem';
import { getSkillSuggestionItems } from '@/skill-suggestion/utils/getSkillSuggestionItems';
import { getSkillTagContent } from '@/skill-suggestion/utils/getSkillTagContent';
import { SuggestionItemPreviewTooltip } from '@/ui/suggestion/components/SuggestionItemPreviewTooltip';
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
  const isMobile = useIsMobile();
  const navigateSettings = useNavigateSettings();
  const hasAiSettingsPermission = useHasPermissionFlag(
    PermissionFlagType.AI_SETTINGS,
  );
  const [search, setSearch] = useState('');
  const [hoveredSkillId, setHoveredSkillId] = useState<string | null>(null);
  const [focusedSkillId, setFocusedSkillId] = useState<string | null>(null);
  const skillRowIdPrefix = useId();
  const getSkillRowId = (skillId: string) => `${skillRowIdPrefix}-${skillId}`;

  const { data, loading } = useQuery(FindManySkillsForSuggestionDocument, {
    fetchPolicy: 'cache-and-network',
  });

  const skills = getSkillSuggestionItems({
    skills: data?.skills ?? [],
    query: search,
  });

  const searchTargetSkillId =
    isNonEmptyString(search.trim()) && !loading ? skills[0]?.id : undefined;

  const previewedSkill = [hoveredSkillId, focusedSkillId, searchTargetSkillId]
    .map((skillId) => skills.find((skill) => skill.id === skillId))
    .find(isDefined);

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
      <Dropdown.Section
        scrollable
        onPointerLeave={() => setHoveredSkillId(null)}
      >
        {skills.map((skill) => {
          const SkillIcon = getIcon(skill.icon ?? DEFAULT_SKILL_ICON);

          return (
            <Dropdown.OptionItem
              key={skill.id}
              id={getSkillRowId(skill.id)}
              selected={false}
              indicator="none"
              disabled={loading}
              startIcon={<SkillIcon />}
              onPointerEnter={() => setHoveredSkillId(skill.id)}
              onFocus={() => setFocusedSkillId(skill.id)}
              onBlur={() => setFocusedSkillId(null)}
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
      {!isMobile && isDefined(previewedSkill) && (
        <SuggestionItemPreviewTooltip
          key={previewedSkill.id}
          anchor={() =>
            document.getElementById(getSkillRowId(previewedSkill.id))
          }
          width={SKILL_SUGGESTION_PREVIEW_WIDTH}
        >
          <SkillSuggestionPreviewCard skill={previewedSkill} />
        </SuggestionItemPreviewTooltip>
      )}
    </>
  );
};
