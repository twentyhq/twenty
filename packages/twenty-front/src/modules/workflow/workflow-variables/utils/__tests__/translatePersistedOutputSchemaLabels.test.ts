import { WORKFLOW_PERSISTED_OUTPUT_SCHEMA_LABELS } from '@/workflow/workflow-variables/constants/WorkflowPersistedOutputSchemaLabels';
import { translatePersistedOutputSchemaLabels } from '@/workflow/workflow-variables/utils/translatePersistedOutputSchemaLabels';
import { i18n } from '@lingui/core';
import { SOURCE_LOCALE } from 'twenty-shared/translations';

const getPersistedLabelMessageId = (key: string) =>
  WORKFLOW_PERSISTED_OUTPUT_SCHEMA_LABELS.find(
    (persistedLabel) => persistedLabel.key === key,
  )?.message.id ?? '';

describe('translatePersistedOutputSchemaLabels', () => {
  beforeEach(() => {
    i18n.load('fr-FR', {
      [getPersistedLabelMessageId('currentItemIndex')]:
        "Index de l'élément courant",
      [getPersistedLabelMessageId('response')]: 'Réponse',
    });
    i18n.activate('fr-FR');
  });

  afterEach(() => {
    i18n.activate(SOURCE_LOCALE);
  });

  it('should translate the labels Twenty writes in English', () => {
    expect(
      translatePersistedOutputSchemaLabels({
        stepType: 'ITERATOR',
        outputSchema: {
          currentItemIndex: {
            isLeaf: true,
            type: 'number',
            label: 'Current Item Index',
            value: 0,
          },
        },
      }),
    ).toEqual({
      currentItemIndex: {
        isLeaf: true,
        type: 'number',
        label: "Index de l'élément courant",
        value: 0,
      },
    });
  });

  it('should keep a user-defined key that carries a label Twenty writes', () => {
    const outputSchema = {
      Response: {
        isLeaf: true as const,
        type: 'string' as const,
        label: 'Response',
        value: '',
      },
    };

    expect(
      translatePersistedOutputSchemaLabels({
        stepType: 'AI_AGENT',
        outputSchema,
      }),
    ).toEqual(outputSchema);
  });

  it('should keep a label Twenty writes for another step type', () => {
    const outputSchema = {
      response: {
        isLeaf: true as const,
        type: 'string' as const,
        label: 'Response',
        value: '',
      },
    };

    expect(
      translatePersistedOutputSchemaLabels({
        stepType: 'CODE',
        outputSchema,
      }),
    ).toEqual(outputSchema);
  });

  it('should keep labels it does not know', () => {
    const outputSchema = {
      constructor: {
        isLeaf: true as const,
        type: 'string' as const,
        label: 'constructor',
        value: '',
      },
      total: {
        isLeaf: true as const,
        type: 'number' as const,
        label: 'Total',
        value: 0,
      },
    };

    expect(
      translatePersistedOutputSchemaLabels({
        stepType: 'ITERATOR',
        outputSchema,
      }),
    ).toEqual(outputSchema);
  });

  it('should keep a __proto__ key as an own key', () => {
    const outputSchema = JSON.parse(
      '{"__proto__":{"isLeaf":true,"type":"string","label":"Proto","value":""}}',
    );

    const translatedOutputSchema = translatePersistedOutputSchemaLabels({
      stepType: 'CODE',
      outputSchema,
    });

    expect(Object.keys(translatedOutputSchema)).toEqual(['__proto__']);
    expect(
      Object.getOwnPropertyDescriptor(translatedOutputSchema, '__proto__')
        ?.value,
    ).toEqual({ isLeaf: true, type: 'string', label: 'Proto', value: '' });
  });
});
