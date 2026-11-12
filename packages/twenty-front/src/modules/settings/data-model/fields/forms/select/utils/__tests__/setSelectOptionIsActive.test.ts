import { type FieldMetadataItemOption } from '@/object-metadata/types/FieldMetadataItem';
import { setSelectOptionIsActive } from '@/settings/data-model/fields/forms/select/utils/setSelectOptionIsActive';

const buildOption = (
  label: string,
  position: number,
  isActive?: false,
): FieldMetadataItemOption => ({
  id: label,
  label,
  value: label.toUpperCase(),
  color: 'green',
  position,
  ...(isActive === false ? { isActive: false } : {}),
});

describe('setSelectOptionIsActive', () => {
  it('moves a deactivated option after the active ones', () => {
    const options = [
      buildOption('New', 0),
      buildOption('Screening', 1),
      buildOption('Won', 2),
      buildOption('Lost', 3, false),
    ];

    expect(
      setSelectOptionIsActive({
        options,
        optionId: 'Screening',
        isActive: false,
      }),
    ).toEqual([
      buildOption('New', 0),
      buildOption('Won', 1),
      buildOption('Lost', 2, false),
      buildOption('Screening', 3, false),
    ]);
  });

  it('moves a reactivated option to the end of the active ones', () => {
    const options = [
      buildOption('New', 0),
      buildOption('Won', 1),
      buildOption('Lost', 2, false),
      buildOption('Screening', 3, false),
    ];

    expect(
      setSelectOptionIsActive({ options, optionId: 'Lost', isActive: true }),
    ).toEqual([
      buildOption('New', 0),
      buildOption('Won', 1),
      buildOption('Lost', 2),
      buildOption('Screening', 3, false),
    ]);
  });
});
