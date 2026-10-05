import { WORKFLOW_PERSISTED_OUTPUT_SCHEMA_LABELS } from '@/workflow/workflow-variables/constants/WorkflowPersistedOutputSchemaLabels';
import { translatePersistedOutputSchemaLabels } from '@/workflow/workflow-variables/utils/translatePersistedOutputSchemaLabels';
import { i18n } from '@lingui/core';
import { SOURCE_LOCALE } from 'twenty-shared/translations';

describe('translatePersistedOutputSchemaLabels', () => {
  afterEach(() => {
    i18n.activate(SOURCE_LOCALE);
  });

  it('should translate the labels Twenty writes in English', () => {
    i18n.load('fr-FR', {
      [WORKFLOW_PERSISTED_OUTPUT_SCHEMA_LABELS['Current Item Index'].id]:
        "Index de l'élément courant",
    });
    i18n.activate('fr-FR');

    expect(
      translatePersistedOutputSchemaLabels({
        currentItemIndex: {
          isLeaf: true,
          type: 'number',
          label: 'Current Item Index',
          value: 0,
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

    expect(translatePersistedOutputSchemaLabels(outputSchema)).toEqual(
      outputSchema,
    );
  });
});
