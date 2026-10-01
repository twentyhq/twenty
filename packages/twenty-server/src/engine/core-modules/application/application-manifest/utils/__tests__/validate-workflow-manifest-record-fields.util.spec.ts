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
    ]),
    fieldByUniversalIdentifier: new Map([[ownerField.id, ownerField]]),
  });

describe('validateWorkflowManifestRecordFields', () => {
  it('requires the join column to update a many-to-one relation', () => {
    expect(validateUpdate({ owner: { id: 'person' } }, ['owner'])).toEqual([
      expect.stringContaining('using the join column for relations'),
    ]);
    expect(validateUpdate({ ownerId: 'person' }, ['ownerId'])).toEqual([]);
  });
});
