import { AiChatCallout } from '@/ai/components/AiChatCallout';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { getDocumentationUrl } from '@/support/utils/getDocumentationUrl';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { t } from '@lingui/core/macro';
import { DOCUMENTATION_PATHS } from 'twenty-shared/constants';
import { IconExternalLink } from 'twenty-ui/icon';

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
    <AiChatCallout
      title={t`AI isn't configured`}
      description={t`Set OPENAI_API_KEY, ANTHROPIC_API_KEY, or XAI_API_KEY in your environment.`}
      action={{
        label: t`View Docs`,
        Icon: IconExternalLink,
        onClick: handleDocsClick,
      }}
    />
  );
};
