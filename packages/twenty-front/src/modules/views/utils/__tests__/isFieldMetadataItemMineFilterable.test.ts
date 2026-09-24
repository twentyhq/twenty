import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { isFieldMetadataItemMineFilterable } from '@/views/utils/isFieldMetadataItemMineFilterable';
import { CoreObjectNameSingular, FieldMetadataType } from 'twenty-shared/types';
import { RelationType } from '~/generated-metadata/graphql';

const buildRelationField = ({
  relationType,
  targetObjectNameSingular,
}: {
  relationType: RelationType;
  targetObjectNameSingular: string;
}) =>
  ({
    id: 'field-id',
    isActive: true,
    type: FieldMetadataType.RELATION,
    relation: {
      type: relationType,
      targetObjectMetadata: { nameSingular: targetObjectNameSingular },
    },
  }) as FieldMetadataItem;

describe('isFieldMetadataItemMineFilterable', () => {
  it('accepts an active actor field', () => {
    expect(
      isFieldMetadataItemMineFilterable({
        id: 'field-id',
        isActive: true,
        type: FieldMetadataType.ACTOR,
      } as FieldMetadataItem),
    ).toBe(true);
  });

  it('accepts a many-to-one relation to workspace members', () => {
    expect(
      isFieldMetadataItemMineFilterable(
        buildRelationField({
          relationType: RelationType.MANY_TO_ONE,
          targetObjectNameSingular: CoreObjectNameSingular.WorkspaceMember,
        }),
      ),
    ).toBe(true);
  });

  it('rejects an inactive field', () => {
    expect(
      isFieldMetadataItemMineFilterable({
        id: 'field-id',
        isActive: false,
        type: FieldMetadataType.ACTOR,
      } as FieldMetadataItem),
    ).toBe(false);
  });

  it('rejects a relation to another object', () => {
    expect(
      isFieldMetadataItemMineFilterable(
        buildRelationField({
          relationType: RelationType.MANY_TO_ONE,
          targetObjectNameSingular: CoreObjectNameSingular.Company,
        }),
      ),
    ).toBe(false);
  });

  it('rejects a one-to-many relation to workspace members', () => {
    expect(
      isFieldMetadataItemMineFilterable(
        buildRelationField({
          relationType: RelationType.ONE_TO_MANY,
          targetObjectNameSingular: CoreObjectNameSingular.WorkspaceMember,
        }),
      ),
    ).toBe(false);
  });

  it('rejects a text field', () => {
    expect(
      isFieldMetadataItemMineFilterable({
        id: 'field-id',
        isActive: true,
        type: FieldMetadataType.TEXT,
      } as FieldMetadataItem),
    ).toBe(false);
  });
});
