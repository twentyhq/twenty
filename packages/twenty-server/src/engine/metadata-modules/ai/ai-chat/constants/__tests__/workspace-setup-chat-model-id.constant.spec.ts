import aiProviders from 'src/engine/metadata-modules/ai/ai-models/ai-providers.json';
import { WORKSPACE_SETUP_CHAT_MODEL_ID } from 'src/engine/metadata-modules/ai/ai-chat/constants/workspace-setup-chat-model-id.constant';
import { buildCompositeModelId } from 'src/engine/metadata-modules/ai/ai-models/utils/composite-model-id.util';

const buildRegisteredCompositeModelIds = (): string[] =>
  Object.entries(
    aiProviders as Record<string, { models?: { name: string }[] }>,
  ).flatMap(([providerKey, provider]) =>
    (provider.models ?? []).map((model) =>
      buildCompositeModelId(providerKey, model.name),
    ),
  );

describe('WORKSPACE_SETUP_CHAT_MODEL_ID', () => {
  it('should be a composite model id registered in the provider catalog', () => {
    expect(buildRegisteredCompositeModelIds()).toContain(
      WORKSPACE_SETUP_CHAT_MODEL_ID,
    );
  });
});
