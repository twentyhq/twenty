import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { getRelatedRecordsRules } from '@/settings/roles/role-permissions/object-level-permissions/related-records/utils/getRelatedRecordsRules';
import { FieldMetadataType, MetadataReadability } from 'twenty-shared/types';
import { RelationType } from '~/generated-metadata/graphql';

const COMPANY_ID = 'company-id';

const buildRelationField = ({
  id,
  targetObjectMetadataId = COMPANY_ID,
  relationType = RelationType.MANY_TO_ONE,
}: {
  id: string;
  targetObjectMetadataId?: string;
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
      targetObjectMetadata: {
        id: targetObjectMetadataId,
        nameSingular: 'company',
        namePlural: 'companies',
      },
    },
  }) as unknown as FieldMetadataItem;

const buildObject = ({
  id,
  fields,
  isCustom = true,
  readabilityParentFields = [],
}: {
  id: string;
  fields: FieldMetadataItem[];
  isCustom?: boolean;
  readabilityParentFields?: FieldMetadataItem[];
}) =>
  ({
    id,
    labelPlural: id,
    isSystem: false,
    applicationId: isCustom ? 'custom-app' : 'standard-app',
    fields,
    readability: isNonEmpty(readabilityParentFields)
      ? MetadataReadability.INHERITED
      : MetadataReadability.OPEN,
    readabilityParentFieldUniversalIdentifiers: readabilityParentFields.map(
      (field) => field.universalIdentifier,
    ),
  }) as unknown as EnrichedObjectMetadataItem;

const isNonEmpty = (array: unknown[]) => array.length > 0;

const invoiceCompany = buildRelationField({ id: 'invoice-company' });
const projectCompany = buildRelationField({ id: 'project-company' });
const personCompany = buildRelationField({ id: 'person-company' });

const invoice = buildObject({
  id: 'invoice',
  fields: [invoiceCompany],
  isCustom: false,
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
    buildRelationField({
      id: 'project-companies',
      relationType: RelationType.ONE_TO_MANY,
    }),
  ],
});
const person = buildObject({
  id: 'person',
  fields: [personCompany],
  isCustom: false,
});

describe('getRelatedRecordsRules', () => {
  it('lists inheriting objects and only offers custom objects to add', () => {
    const { rules, availableRules } = getRelatedRecordsRules({
      parentObjectMetadataId: COMPANY_ID,
      objectMetadataItems: [invoice, project, person],
      isEditableObjectMetadataItem: (objectMetadataItem) =>
        objectMetadataItem.applicationId === 'custom-app',
    });

    expect(
      rules.map(({ parentFieldMetadataItem }) => parentFieldMetadataItem.id),
    ).toEqual(['invoice-company']);
    expect(
      availableRules.map(
        ({ parentFieldMetadataItem }) => parentFieldMetadataItem.id,
      ),
    ).toEqual(['project-company']);
  });

  it('follows morph parents and junction objects as many-to-many', () => {
    const noteTargetMorph = {
      id: 'note-target-target',
      universalIdentifier: 'note-target-morph-id',
      type: FieldMetadataType.MORPH_RELATION,
      isActive: true,
      morphRelations: [
        {
          type: RelationType.MANY_TO_ONE,
          targetObjectMetadata: { id: COMPANY_ID },
        },
      ],
    } as unknown as FieldMetadataItem;

    const noteTarget = {
      id: 'noteTarget',
      isSystem: true,
      fields: [noteTargetMorph],
      readability: MetadataReadability.INHERITED,
      readabilityParentFieldUniversalIdentifiers: ['target-person-field'],
    } as unknown as EnrichedObjectMetadataItem;

    const noteTargetsField = {
      id: 'note-note-targets',
      universalIdentifier: 'note-note-targets-universal-identifier',
      type: FieldMetadataType.RELATION,
      isActive: true,
      relation: {
        type: RelationType.ONE_TO_MANY,
        targetObjectMetadata: { id: 'noteTarget' },
      },
    } as unknown as FieldMetadataItem;

    const note = {
      id: 'note',
      isSystem: false,
      fields: [noteTargetsField],
      readability: MetadataReadability.INHERITED,
      readabilityParentFieldUniversalIdentifiers: [
        noteTargetsField.universalIdentifier,
      ],
    } as unknown as EnrichedObjectMetadataItem;

    const { rules } = getRelatedRecordsRules({
      parentObjectMetadataId: COMPANY_ID,
      objectMetadataItems: [noteTarget, note],
      isEditableObjectMetadataItem: () => false,
    });

    expect(
      rules.map(({ childObjectMetadataItem, relationKind }) => [
        childObjectMetadataItem.id,
        relationKind,
      ]),
    ).toEqual([['note', 'MANY_TO_MANY']]);
  });
});
