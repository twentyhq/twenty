import { WORKFLOW_PERSISTED_OUTPUT_SCHEMA_LABELS } from '@/workflow/workflow-variables/constants/WorkflowPersistedOutputSchemaLabels';
import { translatePersistedOutputSchemaLabels } from '@/workflow/workflow-variables/utils/translatePersistedOutputSchemaLabels';
import { i18n, type MessageDescriptor } from '@lingui/core';
import { SOURCE_LOCALE } from 'twenty-shared/translations';
import { isDefined } from 'twenty-shared/utils';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

const getMessageId = (message?: MessageDescriptor) => {
  if (!isDefined(message?.id)) {
    throw new Error('Persisted output schema label not found');
  }

  return message.id;
};

const company = getMockObjectMetadataItemOrThrow('company');
const companyNameField = company.fields.find(({ name }) => name === 'name');

if (!isDefined(companyNameField)) {
  throw new Error('Company name field not found');
}
const viewerCompany = {
  ...company,
  labelSingular: 'Entreprise',
  labelPlural: 'Entreprises',
  fields: company.fields.map((field) =>
    field.name === 'name' ? { ...field, label: 'Nom' } : field,
  ),
};

const companyRecordOutputSchema = {
  object: {
    label: 'Company',
    objectMetadataId: company.id,
    fieldIdName: 'id',
  },
  fields: {
    name: {
      isLeaf: true,
      type: 'TEXT',
      label: 'Name',
      value: 'Acme',
      fieldMetadataId: companyNameField.id,
    },
  },
  _outputSchemaType: 'RECORD',
};

describe('translatePersistedOutputSchemaLabels', () => {
  beforeEach(() => {
    i18n.load('fr-FR', {
      [getMessageId(
        WORKFLOW_PERSISTED_OUTPUT_SCHEMA_LABELS.ITERATOR?.currentItemIndex,
      )]: "Index de l'élément courant",
      [getMessageId(
        WORKFLOW_PERSISTED_OUTPUT_SCHEMA_LABELS.CLASSIFY?.['answers.*.choice'],
      )]: 'Choix',
    });
    i18n.activate('fr-FR');
  });

  afterEach(() => {
    i18n.activate(SOURCE_LOCALE);
  });

  it('should translate the labels of the keys a step type owns', () => {
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

  it('should keep the labels of keys a user defines', () => {
    const outputSchema = {
      currentItemIndex: {
        isLeaf: true,
        type: 'number',
        label: 'currentItemIndex',
        value: 0,
      },
    };

    expect(
      translatePersistedOutputSchemaLabels({ stepType: 'CODE', outputSchema }),
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
  });

  it('should name the step object and its fields from the viewer metadata', () => {
    expect(
      translatePersistedOutputSchemaLabels({
        stepType: 'WAIT_FOR_EVENT',
        outputSchema: {
          record: {
            isLeaf: false,
            type: 'object',
            label: 'Company',
            value: companyRecordOutputSchema,
          },
          before: {
            isLeaf: false,
            type: 'object',
            label: 'Company Before Update',
            value: companyRecordOutputSchema,
          },
        },
        objectMetadataItems: [viewerCompany],
      }),
    ).toMatchObject({
      record: {
        label: 'Entreprise',
        value: {
          object: { label: 'Entreprise' },
          fields: { name: { label: 'Nom' } },
        },
      },
      before: { label: 'Entreprise Before Update' },
    });
  });

  it('should translate a label under a user-defined key', () => {
    expect(
      translatePersistedOutputSchemaLabels({
        stepType: 'CLASSIFY',
        outputSchema: {
          answers: {
            isLeaf: false,
            type: 'object',
            label: 'Answers',
            value: {
              choice: {
                isLeaf: false,
                type: 'object',
                label: 'choice',
                value: {
                  choice: {
                    isLeaf: true,
                    type: 'string',
                    label: 'Choice',
                    value: 'positive',
                  },
                },
              },
            },
          },
        },
      }),
    ).toMatchObject({
      answers: {
        value: {
          choice: { label: 'choice', value: { choice: { label: 'Choix' } } },
        },
      },
    });
  });
});
