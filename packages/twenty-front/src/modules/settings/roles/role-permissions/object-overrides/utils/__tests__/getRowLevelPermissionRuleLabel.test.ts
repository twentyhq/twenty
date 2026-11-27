import { FieldMetadataType } from 'twenty-shared/types';
import { getRowLevelPermissionRuleLabel } from '@/settings/roles/role-permissions/object-overrides/utils/getRowLevelPermissionRuleLabel';
import {
  RelationType,
  type RowLevelPermissionPredicate,
  RowLevelPermissionPredicateOperand,
} from '~/generated-metadata/graphql';

const OBJECT_METADATA_ITEM = {
  fields: [
    {
      id: 'deleted-at-field',
      label: 'Deleted at',
      type: FieldMetadataType.DATE_TIME,
    },
    {
      id: 'account-owner-field',
      label: 'Account Owner',
      type: FieldMetadataType.RELATION,
    },
    {
      id: 'target-field',
      label: 'Related to',
      type: FieldMetadataType.MORPH_RELATION,
      morphRelations: [
        {
          type: RelationType.MANY_TO_ONE,
          sourceObjectMetadata: {
            id: 'attachment-object',
            nameSingular: 'attachment',
            namePlural: 'attachments',
          },
          targetObjectMetadata: {
            id: 'message-object',
            nameSingular: 'message',
            namePlural: 'messages',
          },
          sourceFieldMetadata: { id: 'target-message-field', name: 'target' },
          targetFieldMetadata: {
            id: 'message-attachments-field',
            name: 'attachments',
          },
        },
      ],
    },
  ],
};

const buildPredicate = (
  overrides: Partial<RowLevelPermissionPredicate>,
): RowLevelPermissionPredicate => ({
  __typename: 'RowLevelPermissionPredicate',
  id: 'predicate-id',
  fieldMetadataId: 'deleted-at-field',
  objectMetadataId: 'object-id',
  roleId: 'role-id',
  operand: RowLevelPermissionPredicateOperand.IS,
  value: '2026-11-12',
  ...overrides,
});

describe('getRowLevelPermissionRuleLabel', () => {
  it('should label a rule with its field, operand and value', () => {
    expect(
      getRowLevelPermissionRuleLabel({
        predicates: [buildPredicate({})],
        objectMetadataItem: OBJECT_METADATA_ITEM,
      }),
    ).toBe('Deleted at is 2026-11-12');
  });

  it('should spell out a relative date instead of its stored value', () => {
    expect(
      getRowLevelPermissionRuleLabel({
        predicates: [
          buildPredicate({
            operand: RowLevelPermissionPredicateOperand.IS_RELATIVE,
            value: 'NEXT_1_DAY;;Europe/Paris;;MONDAY;;',
          }),
        ],
        objectMetadataItem: OBJECT_METADATA_ITEM,
      }),
    ).toBe('Deleted at is relative next 1 day');
  });

  it('should count the other conditions of the rule', () => {
    expect(
      getRowLevelPermissionRuleLabel({
        predicates: [buildPredicate({}), buildPredicate({ id: 'other' })],
        objectMetadataItem: OBJECT_METADATA_ITEM,
      }),
    ).toBe('Deleted at is 2026-11-12 +1');
  });

  it('should name the related records it knows and count the others', () => {
    const accountOwnerPredicate = buildPredicate({
      fieldMetadataId: 'account-owner-field',
      value: 'phil-id',
    });

    expect(
      getRowLevelPermissionRuleLabel({
        predicates: [accountOwnerPredicate],
        objectMetadataItem: OBJECT_METADATA_ITEM,
        recordLabelById: new Map([['phil-id', 'Phil Schiler']]),
      }),
    ).toBe('Account Owner is Phil Schiler');
    expect(
      getRowLevelPermissionRuleLabel({
        predicates: [{ ...accountOwnerPredicate, value: ['phil-id', 'other'] }],
        objectMetadataItem: OBJECT_METADATA_ITEM,
        recordLabelById: new Map([['phil-id', 'Phil Schiler']]),
      }),
    ).toBe('Account Owner is 2 records');
  });

  it('should name a morph relation condition after its field and target object', () => {
    expect(
      getRowLevelPermissionRuleLabel({
        predicates: [
          buildPredicate({
            fieldMetadataId: 'target-message-field',
            operand: RowLevelPermissionPredicateOperand.IS_EMPTY,
            value: null,
          }),
        ],
        objectMetadataItem: OBJECT_METADATA_ITEM,
        objectMetadataItems: [
          { id: 'message-object', labelSingular: 'Message' },
        ],
      }),
    ).toBe('Related to (Message) is empty');
  });
});
