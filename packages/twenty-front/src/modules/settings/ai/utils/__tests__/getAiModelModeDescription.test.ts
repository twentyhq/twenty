import { getAiModelModeDescription } from '@/settings/ai/utils/getAiModelModeDescription';

const model = {
  modelId: 'openai/astra@high',
  label: 'GPT-6 Astra (high reasoning)',
  effort: 'high',
};

describe('getAiModelModeDescription', () => {
  it('handles an unavailable model', () => {
    expect(
      getAiModelModeDescription({ model: undefined, isPinned: false }),
    ).toBe('No model available');
  });

  it('replaces the matching effort suffix with a readable effort label', () => {
    expect(getAiModelModeDescription({ model, isPinned: false })).toBe(
      'GPT-6 Astra · High (Auto)',
    );
  });

  it('adds the effort when the model label has no suffix', () => {
    expect(
      getAiModelModeDescription({
        model: { ...model, label: 'GPT-6 Astra' },
        isPinned: true,
      }),
    ).toBe('GPT-6 Astra · High');
  });

  it.each([undefined, null, '', 'unsupported'])(
    'preserves the model label when effort is %s',
    (effort) => {
      expect(
        getAiModelModeDescription({
          model: { ...model, effort },
          isPinned: true,
        }),
      ).toBe(model.label);
    },
  );

  it('preserves a suffix that does not match the effort', () => {
    expect(
      getAiModelModeDescription({
        model: { ...model, label: 'GPT-6 Astra (custom)' },
        isPinned: true,
      }),
    ).toBe('GPT-6 Astra (custom) · High');
  });

  it('does not mark a pinned model as automatic', () => {
    expect(getAiModelModeDescription({ model, isPinned: true })).toBe(
      'GPT-6 Astra · High',
    );
  });

  it('can hide the automatic marker', () => {
    expect(
      getAiModelModeDescription(
        { model, isPinned: false },
        { showAutomatic: false },
      ),
    ).toBe('GPT-6 Astra · High');
  });

  it('can hide effort while retaining the automatic marker', () => {
    expect(
      getAiModelModeDescription(
        { model, isPinned: false },
        { showEffort: false },
      ),
    ).toBe('GPT-6 Astra (Auto)');
  });

  it('can show only the model name', () => {
    expect(
      getAiModelModeDescription(
        { model, isPinned: false },
        { showAutomatic: false, showEffort: false },
      ),
    ).toBe('GPT-6 Astra');
  });
});
