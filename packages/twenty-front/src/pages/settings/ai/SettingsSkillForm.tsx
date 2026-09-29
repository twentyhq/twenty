import { useQuery } from '@apollo/client/react';
import { t } from '@lingui/core/macro';
import Skeleton from 'react-loading-skeleton';
import { useParams } from 'react-router-dom';
import { isDefined } from 'twenty-shared/utils';
import { Section } from 'twenty-ui/components';
import { useIcons } from 'twenty-ui/icon';
import { useTheme } from 'twenty-ui/theme';

import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsPageLayout } from '@/settings/components/layout/SettingsPageLayout';
import { FindOneSkillDocument } from '~/generated-metadata/graphql';
import { SettingsSkillFormContent } from '~/pages/settings/ai/components/SettingsSkillFormContent';
import { useNavigateToNotFoundOnLoadFailure } from '~/pages/settings/ai/hooks/useNavigateToNotFoundOnLoadFailure';
import { getSettingsAiBreadcrumbLinks } from '~/pages/settings/ai/utils/getSettingsAiBreadcrumbLinks';

export const SettingsSkillForm = ({ mode }: { mode: 'create' | 'edit' }) => {
  const theme = useTheme();
  const { getIcon } = useIcons();
  const { skillId = '' } = useParams<{ skillId: string }>();

  const isCreateMode = mode === 'create';

  const { data, loading, error } = useQuery(FindOneSkillDocument, {
    variables: { id: skillId },
    skip: isCreateMode || !skillId,
  });

  const skill = data?.skill;
  const hasFailedToLoad = !isCreateMode && !loading && !isDefined(skill);

  useNavigateToNotFoundOnLoadFailure({
    hasFailedToLoad,
    error,
    notFoundMessage: t`Skill not found`,
  });

  if (isCreateMode) {
    return <SettingsSkillFormContent />;
  }

  if (hasFailedToLoad) {
    return null;
  }

  if (!isDefined(skill)) {
    const SkillIcon = getIcon('IconBook');

    return (
      <SettingsPageLayout
        title={t`Skill`}
        icon={<SkillIcon size={theme.icon.size.md} color={theme.color.blue9} />}
        links={getSettingsAiBreadcrumbLinks(t`Skill`)}
      >
        <SettingsPageContainer>
          <Section.Root>
            <Skeleton height={400} borderRadius={4} />
          </Section.Root>
        </SettingsPageContainer>
      </SettingsPageLayout>
    );
  }

  return <SettingsSkillFormContent key={skill.id} skill={skill} />;
};
