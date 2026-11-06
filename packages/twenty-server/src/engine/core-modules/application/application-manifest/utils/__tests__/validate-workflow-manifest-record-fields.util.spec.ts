import { FieldMetadataType, RelationType } from 'twenty-shared/types';

import { type WorkflowManifestFieldReference } from 'src/engine/core-modules/application/application-manifest/types/workflow-manifest-references.type';
import { validateWorkflowManifestRecordFields } from 'src/engine/core-modules/application/application-manifest/utils/validate-workflow-manifest-record-fields.util';
import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

const COMPANY_ID = '11111111-1111-4111-8111-111111111111';

const ownerField = {
  objectUniversalIdentifier: COMPANY_ID,
  id: '22222222-2222-4222-8222-222222222222',
  name: 'owner',
  type: FieldMetadataType.RELATION,
  settings: null,
  relationTargetObjectMetadataUniversalIdentifier: null,
  universalSettings: { relationType: RelationType.MANY_TO_ONE },
} as WorkflowManifestFieldReference;

const PERSON_ID = '44444444-4444-4444-8444-444444444444';

const targetPersonField: WorkflowManifestFieldReference = {
  objectUniversalIdentifier: COMPANY_ID,
  id: '55555555-5555-4555-8555-555555555555',
  name: 'targetPerson',
  type: FieldMetadataType.MORPH_RELATION,
  settings: null,
  relationTargetObjectMetadataUniversalIdentifier: PERSON_ID,
  universalSettings: { relationType: RelationType.MANY_TO_ONE },
};

const validateUpdate = (
  objectRecord: Record<string, unknown>,
  fieldsToUpdate: string[],
) =>
  validateWorkflowManifestRecordFields({
    steps: [
      {
        id: '33333333-3333-4333-8333-333333333333',
        name: 'Update',
        type: 'UPDATE_RECORD',
        valid: true,
        settings: {
          input: {
            objectName: 'company',
            objectRecordId: 'record',
            objectRecord,
            fieldsToUpdate,
          },
        },
      } as WorkflowAction,
    ],
    objectByUniversalIdentifier: new Map([
      [COMPANY_ID, { nameSingular: 'company' }],
      [PERSON_ID, { nameSingular: 'person', namePlural: 'people' }],
    ]),
    fieldByUniversalIdentifier: new Map([
      [ownerField.id, ownerField],
      [targetPersonField.id, targetPersonField],
    ]),
  });

describe('validateWorkflowManifestRecordFields', () => {
  it.each([
    ['its field name', { owner: { id: 'person' } }, 'owner'],
    ['its join column', { ownerId: 'person' }, 'ownerId'],
    ['its field name, set by its join column', { ownerId: 'person' }, 'owner'],
    [
      'its join column, set by its field name',
      { owner: { id: 'person' } },
      'ownerId',
    ],
  ])(
    'accepts a many-to-one relation selected by %s',
    (_, objectRecord, fieldToUpdate) => {
      expect(validateUpdate(objectRecord, [fieldToUpdate])).toEqual([]);
    },
  );

  it.each([
    ['its morph name', 'target'],
    ['a morph target', 'targetPerson'],
    ['a morph target join column', 'targetPersonId'],
  ])(
    'accepts a morph relation set by its morph name and selected by %s',
    (_, fieldToUpdate) => {
      expect(
        validateUpdate(
          { target: { targetObjectMetadataId: PERSON_ID, id: 'person' } },
          [fieldToUpdate],
        ),
      ).toEqual([]);
    },
  );

  it('refuses a selected field that matches no field or has no value', () => {
    expect(validateUpdate({ ownerId: 'person' }, ['employer'])).toEqual([
      expect.stringContaining('fieldsToUpdate must select existing fields'),
    ]);
    expect(validateUpdate({}, ['owner'])).toEqual([
      expect.stringContaining('fieldsToUpdate must select existing fields'),
    ]);
  });
});
