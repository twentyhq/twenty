import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { getRelatedRecordsRules } from '@/settings/roles/role-permissions/object-level-permissions/related-records/utils/getRelatedRecordsRules';
import { FieldMetadataType, MetadataReadability } from 'twenty-shared/types';
import { RelationType } from '~/generated-metadata/graphql';

const COMPANY_ID = 'company-id';

const buildRelationField = ({
  id,
  targetObjectMetadataId = COMPANY_ID,
  targetFieldMetadataId = `${id}-inverse`,
  relationType = RelationType.MANY_TO_ONE,
}: {
  id: string;
  targetObjectMetadataId?: string;
  targetFieldMetadataId?: string;
  relationType?: RelationType;
}) =>
  ({
    id,
    universalIdentifier: `${id}-universal-identifier`,
    name: id,
    label: id,
    type: FieldMetadataType.RELATION,
    isActive: true,
    relation: {
      type: relationType,
      targetObjectMetadata: { id: targetObjectMetadataId },
      targetFieldMetadata: { id: targetFieldMetadataId },
    },
  }) as unknown as FieldMetadataItem;

const buildObject = ({
  id,
  fields,
  isSystem = false,
  readability = MetadataReadability.OPEN,
  readabilityParentFields = [],
}: {
  id: string;
  fields: FieldMetadataItem[];
  isSystem?: boolean;
  readability?: MetadataReadability;
  readabilityParentFields?: FieldMetadataItem[];
}) =>
  ({
    id,
    labelPlural: id,
    isSystem,
    isActive: true,
    fields,
    readability:
      readabilityParentFields.length > 0
        ? MetadataReadability.INHERITED
        : readability,
    readabilityParentFieldUniversalIdentifiers: readabilityParentFields.map(
      (field) => field.universalIdentifier,
    ),
  }) as unknown as EnrichedObjectMetadataItem;

const invoiceCompany = buildRelationField({ id: 'invoice-company' });
const projectCompany = buildRelationField({ id: 'project-company' });

const invoice = buildObject({
  id: 'invoice',
  fields: [invoiceCompany],
  readabilityParentFields: [invoiceCompany],
});
const project = buildObject({
  id: 'project',
  fields: [
    projectCompany,
    buildRelationField({
      id: 'project-owner',
      targetObjectMetadataId: 'other',
    }),
  ],
});

const noteTargetNote = buildRelationField({
  id: 'note-target-note',
  targetObjectMetadataId: 'note',
});
const noteTargetMorph = {
  id: 'note-target-target',
  label: 'Target',
  type: FieldMetadataType.MORPH_RELATION,
  isActive: true,
  morphRelations: [
    {
      type: RelationType.MANY_TO_ONE,
      targetObjectMetadata: { id: COMPANY_ID },
      sourceFieldMetadata: { id: 'note-target-target-company' },
    },
    {
      type: RelationType.MANY_TO_ONE,
      targetObjectMetadata: { id: 'person' },
      sourceFieldMetadata: { id: 'note-target-target-person' },
    },
  ],
} as unknown as FieldMetadataItem;
const noteTarget = buildObject({
  id: 'noteTarget',
  isSystem: true,
  fields: [noteTargetNote, noteTargetMorph],
});
const noteNoteTargets = buildRelationField({
  id: 'note-note-targets',
  targetObjectMetadataId: 'noteTarget',
  targetFieldMetadataId: 'note-target-note',
  relationType: RelationType.ONE_TO_MANY,
});
const note = buildObject({ id: 'note', fields: [noteNoteTargets] });

const describeRules = (
  rules: ReturnType<typeof getRelatedRecordsRules>['rules'],
) =>
  rules.map((rule) => ({
    child: rule.childObjectMetadataItem.id,
    fieldMetadataId: rule.fieldMetadataId,
    junctionFieldMetadataId: rule.junctionFieldMetadataId,
    relationKind: rule.relationKind,
    isStored: rule.recordInheritanceRuleId !== undefined,
  }));

describe('getRelatedRecordsRules', () => {
  it('lists declared inheritance as locked rules and offers every other path to the parent', () => {
    const { rules, availableRules } = getRelatedRecordsRules({
      parentObjectMetadataId: COMPANY_ID,
      objectMetadataItems: [invoice, project, noteTarget, note],
      recordInheritanceRules: [],
    });

    expect(describeRules(rules)).toEqual([
      {
        child: 'invoice',
        fieldMetadataId: 'invoice-company',
        junctionFieldMetadataId: null,
        relationKind: 'BELONGS_TO_ONE',
        isStored: false,
      },
    ]);
    expect(describeRules(availableRules)).toEqual([
      {
        child: 'project',
        fieldMetadataId: 'project-company',
        junctionFieldMetadataId: null,
        relationKind: 'BELONGS_TO_ONE',
        isStored: false,
      },
      {
        child: 'note',
        fieldMetadataId: 'note-note-targets',
        junctionFieldMetadataId: 'note-target-target-company',
        relationKind: 'MANY_TO_MANY',
        isStored: false,
      },
    ]);
  });

  it('lists stored rules of the parent and stops offering their path', () => {
    const { rules, availableRules } = getRelatedRecordsRules({
      parentObjectMetadataId: COMPANY_ID,
      objectMetadataItems: [project, noteTarget, note],
      recordInheritanceRules: [
        {
          id: 'rule-id',
          objectMetadataId: 'note',
          parentObjectMetadataId: COMPANY_ID,
          fieldMetadataId: 'note-note-targets',
          junctionFieldMetadataId: 'note-target-target-company',
        },
        {
          id: 'other-parent-rule-id',
          objectMetadataId: 'project',
          parentObjectMetadataId: 'other',
          fieldMetadataId: 'project-owner',
          junctionFieldMetadataId: null,
        },
      ],
    });

    expect(describeRules(rules)).toEqual([
      {
        child: 'note',
        fieldMetadataId: 'note-note-targets',
        junctionFieldMetadataId: 'note-target-target-company',
        relationKind: 'MANY_TO_MANY',
        isStored: true,
      },
    ]);
    expect(describeRules(availableRules).map(({ child }) => child)).toEqual([
      'project',
    ]);
  });

  it('does not go through an object that is neither a system junction nor a configured many-to-many', () => {
    const publicNoteTarget = buildObject({
      id: 'noteTarget',
      fields: [noteTargetNote, noteTargetMorph],
    });

    const { availableRules } = getRelatedRecordsRules({
      parentObjectMetadataId: COMPANY_ID,
      objectMetadataItems: [publicNoteTarget, note],
      recordInheritanceRules: [],
    });

    expect(
      describeRules(availableRules).map(({ child, fieldMetadataId }) => [
        child,
        fieldMetadataId,
      ]),
    ).toEqual([['noteTarget', 'note-target-target-company']]);
  });
});
