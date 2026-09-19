import { getAiModelPinOptions } from '@/settings/ai/utils/getAiModelPinOptions';

describe('getAiModelPinOptions', () => {
  it('keeps evaluation models out of chat and tier pins, including the current pin', () => {
    expect(
      getAiModelPinOptions({
        aiModels: [
          { modelId: 'typesafe/jev', label: 'Jev', kind: 'evaluation' },
          { modelId: 'openai/model', label: 'Language model' },
        ],
        keepModelId: 'typesafe/jev',
      }).map(({ value }) => value),
    ).toEqual(['openai/model']);
  });
});
