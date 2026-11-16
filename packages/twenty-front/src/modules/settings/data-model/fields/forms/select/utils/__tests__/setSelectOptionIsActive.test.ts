import { type FieldMetadataItemOption } from '@/object-metadata/types/FieldMetadataItem';
import { setSelectOptionIsActive } from '@/settings/data-model/fields/forms/select/utils/setSelectOptionIsActive';

const buildOption = ({
  label,
  position,
  isActive,
}: {
  label: string;
  position: number;
  isActive?: false;
}): FieldMetadataItemOption => ({
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
      buildOption({ label: 'New', position: 0 }),
      buildOption({ label: 'Screening', position: 1 }),
      buildOption({ label: 'Won', position: 2 }),
      buildOption({ label: 'Lost', position: 3, isActive: false }),
    ];

    expect(
      setSelectOptionIsActive({
        options,
        optionId: 'Screening',
        isActive: false,
      }),
    ).toEqual([
      buildOption({ label: 'New', position: 0 }),
      buildOption({ label: 'Won', position: 1 }),
      buildOption({ label: 'Lost', position: 2, isActive: false }),
      buildOption({ label: 'Screening', position: 3, isActive: false }),
    ]);
  });

  it('moves a reactivated option to the end of the active ones', () => {
    const options = [
      buildOption({ label: 'New', position: 0 }),
      buildOption({ label: 'Won', position: 1 }),
      buildOption({ label: 'Lost', position: 2, isActive: false }),
      buildOption({ label: 'Screening', position: 3, isActive: false }),
    ];

    expect(
      setSelectOptionIsActive({ options, optionId: 'Lost', isActive: true }),
    ).toEqual([
      buildOption({ label: 'New', position: 0 }),
      buildOption({ label: 'Won', position: 1 }),
      buildOption({ label: 'Lost', position: 2 }),
      buildOption({ label: 'Screening', position: 3, isActive: false }),
    ]);
  });
});
