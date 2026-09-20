import { type GeneratedCatalog } from '../types/generated-catalog.type';
import { type GeneratedModel } from '../types/generated-model.type';
import { mergeEvaluationModels } from '../utils/merge-evaluation-models.util';

const languageModel = (name: string): GeneratedModel => ({
  name,
  label: name,
  contextWindowTokens: 1000,
});

const evaluationModel = (name: string, label = name): GeneratedModel => ({
  name,
  label,
  kind: 'evaluation',
  supportedQuestionTypes: ['choice'],
});

describe('mergeEvaluationModels', () => {
  it('should add a vendor the sync does not carry', () => {
    const catalog: GeneratedCatalog = {
      openai: { models: [languageModel('gpt-5')] },
    };

    mergeEvaluationModels({
      catalog,
      evaluationModels: { 'typesafe-ai': { models: [evaluationModel('jev')] } },
    });

    expect(Object.keys(catalog)).toEqual(['openai', 'typesafe-ai']);
    expect(catalog['typesafe-ai'].models.map(({ name }) => name)).toEqual([
      'jev',
    ]);
  });

  // The whole point of merging per model: the day an existing provider ships an
  // evaluation model, it is one entry in the hand-maintained file and the
  // language models the sync just fetched stay where they are.
  it('should keep the fetched models of a vendor that also ships an evaluation model', () => {
    const catalog: GeneratedCatalog = {
      openai: { models: [languageModel('gpt-5'), languageModel('gpt-5-mini')] },
    };

    mergeEvaluationModels({
      catalog,
      evaluationModels: { openai: { models: [evaluationModel('gpt-eval')] } },
    });

    expect(catalog.openai.models.map(({ name }) => name)).toEqual([
      'gpt-5',
      'gpt-5-mini',
      'gpt-eval',
    ]);
  });

  it('should replace a model of the same name rather than duplicate it', () => {
    const catalog: GeneratedCatalog = {
      'typesafe-ai': { models: [evaluationModel('jev')] },
    };

    mergeEvaluationModels({
      catalog,
      evaluationModels: {
        'typesafe-ai': { models: [evaluationModel('jev', 'Jev (updated)')] },
      },
    });

    expect(catalog['typesafe-ai'].models).toHaveLength(1);
    expect(catalog['typesafe-ai'].models[0].label).toBe('Jev (updated)');
  });

  it('should leave the catalog alone when there is nothing to merge', () => {
    const catalog: GeneratedCatalog = {
      openai: { models: [languageModel('gpt-5')] },
    };

    mergeEvaluationModels({ catalog, evaluationModels: {} });

    expect(catalog).toEqual({ openai: { models: [languageModel('gpt-5')] } });
  });
});
