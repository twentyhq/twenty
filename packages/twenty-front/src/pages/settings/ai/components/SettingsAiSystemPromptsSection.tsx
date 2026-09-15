import { useQuery } from '@apollo/client/react';
import { t } from '@lingui/core/macro';
import { useContext } from 'react';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';
import { IconPrompt } from 'twenty-ui/icon';
import { Section } from 'twenty-ui/primitives/layout';
import { UndecoratedLink } from 'twenty-ui/primitives/navigation';
import { H2Title } from 'twenty-ui/primitives/typography';
import { ThemeContext } from 'twenty-ui/theme-constants';
import { SettingsCard } from '@/settings/components/SettingsCard';
import { GetAiSystemPromptPreviewDocument } from '~/generated-metadata/graphql';
import { formatNumber } from '~/utils/format/formatNumber';

export const SettingsAiSystemPromptsSection = () => {
  const { theme } = useContext(ThemeContext);
  const { data: previewData } = useQuery(GetAiSystemPromptPreviewDocument);

  const systemPromptTokenCount =
    previewData?.getAiSystemPromptPreview.estimatedTokenCount;
  const systemPromptDescription = isDefined(systemPromptTokenCount)
    ? t`Read the system prompts to understand how the AI works (~${formatNumber(
        systemPromptTokenCount,
        { abbreviate: true, decimals: 1 },
      )} tokens)`
    : t`Read the system prompts to understand how the AI works`;

  return (
    <Section>
      <H2Title title={t`System Prompt`} description={systemPromptDescription} />
      <UndecoratedLink to={getSettingsPath(SettingsPath.AiPrompts)}>
        <SettingsCard
          Icon={<IconPrompt size={theme.icon.size.md} />}
          title={t`Read system prompts`}
        />
      </UndecoratedLink>
    </Section>
  );
};
