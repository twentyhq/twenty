import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { getRelatedRecordsRules } from '@/settings/roles/role-permissions/object-level-permissions/related-records/utils/getRelatedRecordsRules';
import { MetadataReadability } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { getMockFieldMetadataItemOrThrow } from '~/testing/utils/getMockFieldMetadataItemOrThrow';
import { getTestEnrichedObjectMetadataItemsMock } from '~/testing/utils/getTestEnrichedObjectMetadataItemsMock';

const getObjectMetadataItems = (
  overrides: Record<string, Partial<EnrichedObjectMetadataItem>> = {},
): EnrichedObjectMetadataItem[] =>
  getTestEnrichedObjectMetadataItemsMock().map((objectMetadataItem) => ({
    ...objectMetadataItem,
    readability: MetadataReadability.OPEN,
    ...overrides[objectMetadataItem.nameSingular],
  }));

const findObjectMetadataItem = (
  objectMetadataItems: EnrichedObjectMetadataItem[],
  nameSingular: string,
): EnrichedObjectMetadataItem => {
  const objectMetadataItem = objectMetadataItems.find(
    (item) => item.nameSingular === nameSingular,
  );

  if (!isDefined(objectMetadataItem)) {
    throw new Error(`Missing ${nameSingular} mock`);
  }

  return objectMetadataItem;
};

const describePath = ({
  childObjectMetadataItem,
  fieldMetadataId,
  junctionFieldMetadataId,
  recordInheritanceRuleId,
}: ReturnType<typeof getRelatedRecordsRules>['rules'][number]) => ({
  child: childObjectMetadataItem.nameSingular,
  fieldMetadataId,
  junctionFieldMetadataId,
  isStored: isDefined(recordInheritanceRuleId),
});

const objectMetadataItems = getObjectMetadataItems();
const company = findObjectMetadataItem(objectMetadataItems, 'company');
const person = findObjectMetadataItem(objectMetadataItems, 'person');
const note = findObjectMetadataItem(objectMetadataItems, 'note');
const noteTarget = findObjectMetadataItem(objectMetadataItems, 'noteTarget');

const personCompanyField = getMockFieldMetadataItemOrThrow({
  objectMetadataItem: person,
  fieldName: 'company',
});
const noteNoteTargetsField = getMockFieldMetadataItemOrThrow({
  objectMetadataItem: note,
  fieldName: 'noteTargets',
});
const noteTargetCompanyFieldId = getMockFieldMetadataItemOrThrow({
  objectMetadataItem: noteTarget,
  fieldName: 'target',
}).morphRelations?.find(
  (morphRelation) => morphRelation.targetObjectMetadata.id === company.id,
)?.sourceFieldMetadata.id;

describe('getRelatedRecordsRules', () => {
  it('offers one hop relations and junction paths to the parent', () => {
    const { rules, availableRules } = getRelatedRecordsRules({
      parentObjectMetadataId: company.id,
      objectMetadataItems,
      recordInheritanceRules: [],
    });

    expect(rules).toEqual([]);
    expect(availableRules.map(describePath)).toEqual(
      expect.arrayContaining([
        {
          child: 'person',
          fieldMetadataId: personCompanyField.id,
          junctionFieldMetadataId: null,
          isStored: false,
        },
        {
          child: 'note',
          fieldMetadataId: noteNoteTargetsField.id,
          junctionFieldMetadataId: noteTargetCompanyFieldId,
          isStored: false,
        },
      ]),
    );
  });

  it('does not go through objects that are neither junctions nor configured many-to-many', () => {
    const { availableRules } = getRelatedRecordsRules({
      parentObjectMetadataId: company.id,
      objectMetadataItems,
      recordInheritanceRules: [],
    });

    const timelineActivitiesFieldIds = objectMetadataItems.flatMap(
      (objectMetadataItem) =>
        objectMetadataItem.fields
          .filter((field) => field.name === 'timelineActivities')
          .map((field) => field.id),
    );

    expect(
      availableRules.filter(({ fieldMetadataId }) =>
        timelineActivitiesFieldIds.includes(fieldMetadataId),
      ),
    ).toEqual([]);
  });

  it('lists stored rules of the parent and stops offering their path', () => {
    const { rules, availableRules } = getRelatedRecordsRules({
      parentObjectMetadataId: company.id,
      objectMetadataItems,
      recordInheritanceRules: [
        {
          id: 'rule-id',
          objectMetadataId: person.id,
          parentObjectMetadataId: company.id,
          fieldMetadataId: personCompanyField.id,
          junctionFieldMetadataId: null,
        },
      ],
    });

    expect(rules.map(describePath)).toEqual([
      {
        child: 'person',
        fieldMetadataId: personCompanyField.id,
        junctionFieldMetadataId: null,
        isStored: true,
      },
    ]);
    expect(
      availableRules.some(
        ({ fieldMetadataId }) => fieldMetadataId === personCompanyField.id,
      ),
    ).toBe(false);
  });

  it('lists inheritance declared by an app as locked and does not offer its paths', () => {
    const declaringObjectMetadataItems = getObjectMetadataItems({
      note: {
        readability: MetadataReadability.INHERITED,
        readabilityParentFieldUniversalIdentifiers: [
          noteNoteTargetsField.universalIdentifier,
        ],
      },
      noteTarget: {
        readability: MetadataReadability.INHERITED,
        readabilityParentFieldUniversalIdentifiers: [
          'note-target-morph-universal-identifier',
        ],
      },
    });

    const { rules, availableRules } = getRelatedRecordsRules({
      parentObjectMetadataId: company.id,
      objectMetadataItems: declaringObjectMetadataItems,
      recordInheritanceRules: [],
    });

    expect(rules.map(describePath)).toEqual([
      {
        child: 'note',
        fieldMetadataId: noteNoteTargetsField.id,
        junctionFieldMetadataId: null,
        isStored: false,
      },
    ]);
    expect(
      availableRules.some(
        ({ fieldMetadataId }) => fieldMetadataId === noteNoteTargetsField.id,
      ),
    ).toBe(false);
  });
});
