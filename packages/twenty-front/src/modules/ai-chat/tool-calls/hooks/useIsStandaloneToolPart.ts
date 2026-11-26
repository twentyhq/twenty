import { isToolUIPart } from 'ai';
import { type ExtendedUIMessagePart } from 'twenty-shared/ai';

import { useFrontComponentIdByToolName } from '@/ai-chat/tool-calls/hooks/useFrontComponentIdByToolName';
import { getEffectiveToolName } from '@/ai-chat/tool-calls/utils/getEffectiveToolName';
import { shouldToolPartRenderStandalone } from '@/ai-chat/tool-calls/utils/shouldToolPartRenderStandalone';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { FeatureFlagKey } from '~/generated-metadata/graphql';

export const useIsStandaloneToolPart = () => {
  const frontComponentIdByToolName = useFrontComponentIdByToolName();
  const isFrontComponentPreviewEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_AI_CHAT_COMPONENT_BUILDER_ENABLED,
  );

  return (part: ExtendedUIMessagePart): boolean =>
    isToolUIPart(part) &&
    shouldToolPartRenderStandalone({
      toolPart: part,
      frontComponentId: frontComponentIdByToolName.get(
        getEffectiveToolName(part),
      ),
      isFrontComponentPreviewEnabled,
    });
};
