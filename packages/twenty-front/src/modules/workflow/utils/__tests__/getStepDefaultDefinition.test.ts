import { generatedMockObjectMetadataItems } from '~/testing/mock-data/generatedMockObjectMetadataItems';
import { getStepDefaultDefinition } from '../getStepDefaultDefinition';

it('returns a valid definition for CODE actions', () => {
  expect(
    getStepDefaultDefinition({
      type: 'CODE',
      activeObjectMetadataItems: generatedMockObjectMetadataItems,
    }),
  ).toStrictEqual({
    id: expect.any(String),
    name: 'Code',
    type: 'CODE',
    valid: false,
    settings: {
      input: {
        serverlessFunctionId: '',
        serverlessFunctionVersion: '',
        serverlessFunctionInput: {},
      },
      outputSchema: {},
      errorHandlingOptions: {
        continueOnFailure: {
          value: false,
        },
        retryOnFailure: {
          value: false,
        },
      },
    },
  });
});

it('returns a valid definition for SEND_EMAIL actions', () => {
  expect(
    getStepDefaultDefinition({
      type: 'SEND_EMAIL',
      activeObjectMetadataItems: generatedMockObjectMetadataItems,
    }),
  ).toStrictEqual({
    id: expect.any(String),
    name: 'Send Email',
    type: 'SEND_EMAIL',
    valid: false,
    settings: {
      input: {
        connectedAccountId: '',
        email: '',
        subject: '',
        body: '',
      },
      outputSchema: {},
      errorHandlingOptions: {
        continueOnFailure: {
          value: false,
        },
        retryOnFailure: {
          value: false,
        },
      },
    },
  });
});

it('returns a valid definition for RECORD_CRUD.CREATE actions', () => {
  expect(
    getStepDefaultDefinition({
      type: 'RECORD_CRUD.CREATE',
      activeObjectMetadataItems: generatedMockObjectMetadataItems,
    }),
  ).toStrictEqual({
    id: expect.any(String),
    name: 'Create Record',
    type: 'RECORD_CRUD',
    valid: false,
    settings: {
      input: {
        type: 'CREATE',
        objectName: generatedMockObjectMetadataItems[0].nameSingular,
        objectRecord: {},
      },
      outputSchema: {},
      errorHandlingOptions: {
        continueOnFailure: {
          value: false,
        },
        retryOnFailure: {
          value: false,
        },
      },
    },
  });
});

it('returns a valid definition for RECORD_CRUD.UPDATE actions', () => {
  expect(
    getStepDefaultDefinition({
      type: 'RECORD_CRUD.UPDATE',
      activeObjectMetadataItems: generatedMockObjectMetadataItems,
    }),
  ).toStrictEqual({
    id: expect.any(String),
    name: 'Update Record',
    type: 'RECORD_CRUD',
    valid: false,
    settings: {
      input: {
        type: 'UPDATE',
        objectName: generatedMockObjectMetadataItems[0].nameSingular,
        objectRecord: {},
        objectRecordId: '',
      },
      outputSchema: {},
      errorHandlingOptions: {
        continueOnFailure: {
          value: false,
        },
        retryOnFailure: {
          value: false,
        },
      },
    },
  });
});

it("throws for RECORD_CRUD.DELETE actions as it's not implemented yet", () => {
  expect(() => {
    getStepDefaultDefinition({
      type: 'RECORD_CRUD.DELETE',
      activeObjectMetadataItems: generatedMockObjectMetadataItems,
    });
  }).toThrow('Not implemented yet');
});

it('throws when providing an unknown type', () => {
  expect(() => {
    getStepDefaultDefinition({
      type: 'unknown' as any,
      activeObjectMetadataItems: generatedMockObjectMetadataItems,
    });
  }).toThrow('Unknown type: unknown');
});
