import { InlineBanner } from 'twenty-ui/components/feedback';
import { AiChatInlineBanner } from '@/ai/components/AiChatInlineBanner';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { getDocumentationUrl } from '@/support/utils/getDocumentationUrl';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { DOCUMENTATION_PATHS } from 'twenty-shared/constants';
import { IconExternalLink } from 'twenty-ui/icon';
import { openUrlInNewTab } from '~/utils/openUrlInNewTab';
import { useLingui } from '@lingui/react/macro';

export const AiChatApiKeyNotConfiguredMessage = () => {
  const { t } = useLingui();
  const currentWorkspaceMember = useAtomStateValue(currentWorkspaceMemberState);

  const handleDocsClick = () => {
    const docsUrl = getDocumentationUrl({
      locale: currentWorkspaceMember?.locale,
      path: DOCUMENTATION_PATHS.DEVELOPERS_SELF_HOST_CAPABILITIES_SETUP,
    });
    openUrlInNewTab(docsUrl);
  };

  return (
    <AiChatInlineBanner
      action={
        <InlineBanner.Action
          startIcon={<IconExternalLink />}
          onClick={handleDocsClick}
        >{t`View Docs`}</InlineBanner.Action>
      }
    >{t`Add an API key to enable AI.`}</AiChatInlineBanner>
  );
};
