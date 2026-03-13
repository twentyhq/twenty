import {
  getRecordInputPlaceholdersForRequiredFields,
  getRequiredFieldsUnfillableErrorMessage,
  getRequiredRelationFieldsMissingErrorMessage,
  REQUIRED_FIELDS_UNFILLABLE_ERROR_CODE,
  REQUIRED_RELATION_FIELDS_MISSING_ERROR_CODE,
} from '@/object-record/utils/getRecordInputPlaceholdersForRequiredFields';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { FieldMetadataType, RelationType } from '~/generated-metadata/graphql';

const createMockObjectMetadataItem = (
  overrides: Partial<ObjectMetadataItem> & {
    fields: ObjectMetadataItem['fields'];
  },
): ObjectMetadataItem =>
  ({
    nameSingular: 'playbook',
    labelSingular: 'Playbook',
    labelPlural: 'Playbooks',
    fields: [],
    ...overrides,
  }) as ObjectMetadataItem;

const createMockField = (
  overrides: Partial<FieldMetadataItem>,
): FieldMetadataItem =>
  ({
    id: 'field-id',
    name: 'title',
    label: 'Title',
    type: FieldMetadataType.TEXT,
    isNullable: false,
    ...overrides,
  }) as FieldMetadataItem;

describe('getRecordInputPlaceholdersForRequiredFields', () => {
  it('should add placeholder for missing required TEXT label identifier', () => {
    const objectMetadataItem = createMockObjectMetadataItem({
      labelIdentifierFieldMetadataId: 'title-field-id',
      fields: [
        createMockField({
          id: 'title-field-id',
          name: 'title',
          type: FieldMetadataType.TEXT,
          isNullable: false,
        }),
      ],
    });

    const { placeholders, missingRequiredRelationFields } =
      getRecordInputPlaceholdersForRequiredFields(objectMetadataItem, {});

    expect(placeholders.title).toBeDefined();
    expect(typeof placeholders.title).toBe('string');
    expect((placeholders.title as string).length).toBeGreaterThan(0);
    expect(missingRequiredRelationFields).toHaveLength(0);
  });

  it('should skip placeholder when value already provided', () => {
    const objectMetadataItem = createMockObjectMetadataItem({
      labelIdentifierFieldMetadataId: 'title-field-id',
      fields: [
        createMockField({
          id: 'title-field-id',
          name: 'title',
          type: FieldMetadataType.TEXT,
          isNullable: false,
        }),
      ],
    });

    const { placeholders } = getRecordInputPlaceholdersForRequiredFields(
      objectMetadataItem,
      { title: 'My Playbook' },
    );

    expect(placeholders.title).toBeUndefined();
  });

  it('should add missing required relation to missingRequiredRelationFields', () => {
    const objectMetadataItem = createMockObjectMetadataItem({
      labelIdentifierFieldMetadataId: 'title-field-id',
      fields: [
        createMockField({
          id: 'title-field-id',
          name: 'title',
          type: FieldMetadataType.TEXT,
          isNullable: false,
        }),
        createMockField({
          id: 'workspace-field-id',
          name: 'workspace',
          label: 'Workspace',
          type: FieldMetadataType.RELATION,
          isNullable: false,
          relation: { type: RelationType.MANY_TO_ONE },
        }),
      ],
    });

    const { placeholders, missingRequiredRelationFields } =
      getRecordInputPlaceholdersForRequiredFields(objectMetadataItem, {});

    expect(placeholders.title).toBeDefined();
    expect(missingRequiredRelationFields).toHaveLength(1);
    expect(missingRequiredRelationFields[0].name).toBe('workspace');
  });

  it('should treat relation as provided when {fieldName}Id is set', () => {
    const objectMetadataItem = createMockObjectMetadataItem({
      labelIdentifierFieldMetadataId: 'title-field-id',
      fields: [
        createMockField({
          id: 'title-field-id',
          name: 'title',
          type: FieldMetadataType.TEXT,
          isNullable: false,
        }),
        createMockField({
          id: 'workspace-field-id',
          name: 'workspace',
          label: 'Workspace',
          type: FieldMetadataType.RELATION,
          isNullable: false,
          relation: { type: RelationType.MANY_TO_ONE },
        }),
      ],
    });

    const { missingRequiredRelationFields } =
      getRecordInputPlaceholdersForRequiredFields(objectMetadataItem, {
        workspaceId: 'existing-workspace-id',
      });

    expect(missingRequiredRelationFields).toHaveLength(0);
  });
});

describe('getRequiredRelationFieldsMissingErrorMessage', () => {
  it('should return formatted message with field labels', () => {
    const fields = [
      createMockField({
        name: 'workspace',
        label: 'Workspace',
        type: FieldMetadataType.RELATION,
      }),
      createMockField({
        name: 'owner',
        label: 'Owner',
        type: FieldMetadataType.RELATION,
      }),
    ];

    const message = getRequiredRelationFieldsMissingErrorMessage(fields);

    expect(message).toContain('Workspace');
    expect(message).toContain('Owner');
    expect(message).toContain('required but cannot be auto-filled');
  });
});

describe('REQUIRED_RELATION_FIELDS_MISSING_ERROR_CODE', () => {
  it('should be the expected constant', () => {
    expect(REQUIRED_RELATION_FIELDS_MISSING_ERROR_CODE).toBe(
      'REQUIRED_RELATION_FIELDS_MISSING',
    );
  });
});

describe('missingRequiredFieldsUnfillable', () => {
  it('should add required SELECT with no options to missingRequiredFieldsUnfillable', () => {
    const objectMetadataItem = createMockObjectMetadataItem({
      labelIdentifierFieldMetadataId: 'title-field-id',
      fields: [
        createMockField({
          id: 'title-field-id',
          name: 'title',
          type: FieldMetadataType.TEXT,
          isNullable: false,
        }),
        createMockField({
          id: 'status-field-id',
          name: 'status',
          label: 'Status',
          type: FieldMetadataType.SELECT,
          isNullable: false,
          options: [],
        }),
      ],
    });

    const { placeholders, missingRequiredFieldsUnfillable } =
      getRecordInputPlaceholdersForRequiredFields(objectMetadataItem, {});

    expect(placeholders.title).toBeDefined();
    expect(placeholders.status).toBeUndefined();
    expect(missingRequiredFieldsUnfillable).toHaveLength(1);
    expect(missingRequiredFieldsUnfillable[0].name).toBe('status');
  });
});

describe('getRequiredFieldsUnfillableErrorMessage', () => {
  it('should return formatted message', () => {
    const fields = [createMockField({ name: 'status', label: 'Status' })];
    const message = getRequiredFieldsUnfillableErrorMessage(fields);
    expect(message).toContain('Status');
    expect(message).toContain('cannot be auto-filled');
  });
});

describe('REQUIRED_FIELDS_UNFILLABLE_ERROR_CODE', () => {
  it('should be the expected constant', () => {
    expect(REQUIRED_FIELDS_UNFILLABLE_ERROR_CODE).toBe(
      'REQUIRED_FIELDS_UNFILLABLE',
    );
  });
});
