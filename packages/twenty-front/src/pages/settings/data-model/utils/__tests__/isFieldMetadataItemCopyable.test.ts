import { FieldMetadataType } from '~/generated-metadata/graphql';
import { isFieldMetadataItemCopyable } from '~/pages/settings/data-model/utils/isFieldMetadataItemCopyable';

describe('isFieldMetadataItemCopyable', () => {
  it('allows a custom select field', () => {
    expect(
      isFieldMetadataItemCopyable({
        name: 'priority',
        type: FieldMetadataType.SELECT,
        isSystem: false,
      }),
    ).toBe(true);
  });

  it('rejects system fields', () => {
    expect(
      isFieldMetadataItemCopyable({
        name: 'position',
        type: FieldMetadataType.POSITION,
        isSystem: true,
      }),
    ).toBe(false);
  });

  it('rejects audit fields', () => {
    expect(
      isFieldMetadataItemCopyable({
        name: 'createdAt',
        type: FieldMetadataType.DATE_TIME,
        isSystem: false,
      }),
    ).toBe(false);
  });

  it('rejects relation fields', () => {
    expect(
      isFieldMetadataItemCopyable({
        name: 'company',
        type: FieldMetadataType.RELATION,
        isSystem: false,
      }),
    ).toBe(false);
  });

  it('rejects field types that cannot be created from settings', () => {
    expect(
      isFieldMetadataItemCopyable({
        name: 'owner',
        type: FieldMetadataType.ACTOR,
        isSystem: false,
      }),
    ).toBe(false);
  });
});
