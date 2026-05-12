import { AiChatBanner } from '@/ai/components/AiChatBanner';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { getDocumentationUrl } from '@/support/utils/getDocumentationUrl';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { t } from '@lingui/core/macro';
import { DOCUMENTATION_PATHS } from 'twenty-shared/constants';
import { IconExternalLink } from 'twenty-ui/display';

export const AiChatApiKeyNotConfiguredMessage = () => {
  const currentWorkspaceMember = useAtomStateValue(currentWorkspaceMemberState);

  const handleDocsClick = () => {
    const docsUrl = getDocumentationUrl({
      locale: currentWorkspaceMember?.locale,
      path: DOCUMENTATION_PATHS.DEVELOPERS_SELF_HOST_CAPABILITIES_SETUP,
    });
    window.open(docsUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <AiChatBanner
      message={t`AI not configured. Set OPENAI_API_KEY, ANTHROPIC_API_KEY, or XAI_API_KEY in your environment.`}
      variant="warning"
      buttonTitle={t`View Docs`}
      buttonIcon={IconExternalLink}
      buttonOnClick={handleDocsClick}
    />
  );
};
