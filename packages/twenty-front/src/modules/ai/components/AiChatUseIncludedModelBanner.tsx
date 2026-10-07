import { useLingui } from '@lingui/react/macro';
import { InlineBanner } from 'twenty-ui/components/feedback';

import { agentChatUserSelectedModelTierState } from '@/ai/states/agentChatUserSelectedModelTierState';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';

type AiChatUseIncludedModelBannerProps = {
  includedModelLabel: string;
};

// Following the workspace tier again is what lets the server switch to the included model
export const AiChatUseIncludedModelBanner = ({
  includedModelLabel,
}: AiChatUseIncludedModelBannerProps) => {
  const { t } = useLingui();
  const setAgentChatUserSelectedModelTier = useSetAtomState(
    agentChatUserSelectedModelTierState,
  );

  return (
    <InlineBanner
      embedded
      color="blue"
      message={t`${includedModelLabel} is included and keeps working without credits.`}
      button={{
        title: t`Use ${includedModelLabel}`,
        onClick: () => setAgentChatUserSelectedModelTier(null),
      }}
    />
  );
};
