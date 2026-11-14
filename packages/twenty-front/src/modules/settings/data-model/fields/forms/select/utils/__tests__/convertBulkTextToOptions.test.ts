import { type FieldMetadataItemOption } from '@/object-metadata/types/FieldMetadataItem';
import { convertBulkTextToOptions } from '@/settings/data-model/fields/forms/select/utils/convertBulkTextToOptions';

describe('convertBulkTextToOptions', () => {
  it('converts newline-separated text to options', () => {
    const text = 'Option 1\nOption 2\nOption 3';
    const currentOptions: FieldMetadataItemOption[] = [];

    const result = convertBulkTextToOptions({ text, currentOptions });

    expect(result).toHaveLength(3);
    expect(result[0].label).toBe('Option 1');
    expect(result[0].position).toBe(0);
    expect(result[1].label).toBe('Option 2');
    expect(result[1].position).toBe(1);
    expect(result[2].label).toBe('Option 3');
    expect(result[2].position).toBe(2);
  });

  it('returns empty array for empty text', () => {
    const text = '';
    const currentOptions: FieldMetadataItemOption[] = [];

    const result = convertBulkTextToOptions({ text, currentOptions });

    expect(result).toHaveLength(0);
  });

  it('returns empty array for whitespace-only text', () => {
    const text = '   \n   \n   ';
    const currentOptions: FieldMetadataItemOption[] = [];

    const result = convertBulkTextToOptions({ text, currentOptions });

    expect(result).toHaveLength(0);
  });

  it('trims whitespace from lines', () => {
    const text = '  Option 1  \n  Option 2  ';
    const currentOptions: FieldMetadataItemOption[] = [];

    const result = convertBulkTextToOptions({ text, currentOptions });

    expect(result).toHaveLength(2);
    expect(result[0].label).toBe('Option 1');
    expect(result[1].label).toBe('Option 2');
  });

  it('filters out empty lines', () => {
    const text = 'Option 1\n\n\nOption 2\n\nOption 3';
    const currentOptions: FieldMetadataItemOption[] = [];

    const result = convertBulkTextToOptions({ text, currentOptions });

    expect(result).toHaveLength(3);
    expect(result[0].label).toBe('Option 1');
    expect(result[1].label).toBe('Option 2');
    expect(result[2].label).toBe('Option 3');
  });

  it('preserves existing option metadata when label matches (case-insensitive)', () => {
    const text = 'option 1\nOption 2';
    const currentOptions: FieldMetadataItemOption[] = [
      {
        id: 'existing-id-1',
        label: 'Option 1',
        value: 'OPTION_1',
        color: 'blue',
        position: 0,
      },
      {
        id: 'existing-id-2',
        label: 'Option 2',
        value: 'OPTION_2',
        color: 'green',
        position: 1,
      },
    ];

    const result = convertBulkTextToOptions({ text, currentOptions });

    expect(result).toHaveLength(2);
    expect(result[0].id).toBe('existing-id-1');
    expect(result[0].color).toBe('blue');
    expect(result[0].label).toBe('Option 1'); // preserves original label casing
    expect(result[0].position).toBe(0);
    expect(result[1].id).toBe('existing-id-2');
    expect(result[1].color).toBe('green');
    expect(result[1].label).toBe('Option 2'); // preserves original label casing
    expect(result[1].position).toBe(1);
  });

  it('creates new options for labels that do not exist', () => {
    const text = 'Existing Option\nNew Option';
    const currentOptions: FieldMetadataItemOption[] = [
      {
        id: 'existing-id',
        label: 'Existing Option',
        value: 'EXISTING_OPTION',
        color: 'blue',
        position: 0,
      },
    ];

    const result = convertBulkTextToOptions({ text, currentOptions });

    expect(result).toHaveLength(2);
    expect(result[0].id).toBe('existing-id');
    expect(result[1].label).toBe('New Option');
    expect(result[1].id).toBeDefined();
    expect(result[1].id).not.toBe('existing-id');
  });

  it('updates positions correctly when reordering', () => {
    const text = 'Option 2\nOption 1';
    const currentOptions: FieldMetadataItemOption[] = [
      {
        id: 'id-1',
        label: 'Option 1',
        value: 'OPTION_1',
        color: 'blue',
        position: 0,
      },
      {
        id: 'id-2',
        label: 'Option 2',
        value: 'OPTION_2',
        color: 'green',
        position: 1,
      },
    ];

    const result = convertBulkTextToOptions({ text, currentOptions });

    expect(result).toHaveLength(2);
    expect(result[0].id).toBe('id-2');
    expect(result[0].position).toBe(0);
    expect(result[1].id).toBe('id-1');
    expect(result[1].position).toBe(1);
  });

  it('handles mixed existing and new options', () => {
    const text = 'Existing\nNew 1\nAnother Existing\nNew 2';
    const currentOptions: FieldMetadataItemOption[] = [
      {
        id: 'existing-1',
        label: 'Existing',
        value: 'EXISTING',
        color: 'blue',
        position: 0,
      },
      {
        id: 'existing-2',
        label: 'Another Existing',
        value: 'ANOTHER_EXISTING',
        color: 'red',
        position: 1,
      },
    ];

    const result = convertBulkTextToOptions({ text, currentOptions });

    expect(result).toHaveLength(4);
    expect(result[0].id).toBe('existing-1');
    expect(result[0].position).toBe(0);
    expect(result[1].label).toBe('New 1');
    expect(result[1].position).toBe(1);
    expect(result[2].id).toBe('existing-2');
    expect(result[2].position).toBe(2);
    expect(result[3].label).toBe('New 2');
    expect(result[3].position).toBe(3);
  });

  it('skips a line repeating an earlier one', () => {
    const result = convertBulkTextToOptions({
      text: 'Option 1\noption 1\nOption 2',
      currentOptions: [],
    });

    expect(result.map(({ label }) => label)).toEqual(['Option 1', 'Option 2']);
  });

  it('does not match an option a previous line already renamed', () => {
    const doneOption: FieldMetadataItemOption = {
      id: 'done',
      label: 'Done',
      value: 'COMPLETED',
      color: 'green',
      position: 0,
    };

    const result = convertBulkTextToOptions({
      text: 'Completed\nDone',
      currentOptions: [doneOption],
    });

    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({ ...doneOption, label: 'Completed' });
    expect(result[1]).toMatchObject({ label: 'Done', value: 'DONE' });
    expect(result[1].id).not.toBe('done');
  });

  describe('with inactive and application options', () => {
    const newOption: FieldMetadataItemOption = {
      id: 'new',
      label: 'New',
      value: 'NEW',
      color: 'green',
      position: 0,
    };
    const screeningOption: FieldMetadataItemOption = {
      id: 'screening',
      label: 'Screening',
      value: 'SCREENING',
      color: 'blue',
      position: 1,
    };
    const partnerOption: FieldMetadataItemOption = {
      id: 'partner',
      label: 'Partner',
      value: 'PARTNER',
      color: 'purple',
      position: 2,
      applicationId: 'workspace-application',
    };
    const lostOption: FieldMetadataItemOption = {
      id: 'lost',
      label: 'Lost',
      value: 'LOST',
      color: 'red',
      position: 3,
      isActive: false,
    };
    const currentOptions = [
      newOption,
      screeningOption,
      partnerOption,
      lostOption,
    ];
    const applicationOptionIds = new Set(['new', 'screening', 'lost']);

    it('deactivates an unlisted application option and drops an unlisted custom one', () => {
      expect(
        convertBulkTextToOptions({
          text: 'New',
          currentOptions,
          nonRemovableOptionIds: applicationOptionIds,
        }),
      ).toEqual([
        newOption,
        { ...screeningOption, position: 1, isActive: false },
        { ...lostOption, position: 2 },
      ]);
    });

    it('keeps an inactive option out of the text inactive', () => {
      expect(
        convertBulkTextToOptions({
          text: 'New\nScreening\nPartner',
          currentOptions,
          nonRemovableOptionIds: applicationOptionIds,
        }),
      ).toEqual(currentOptions);
    });

    it('renames a kept option when a new label would get its value', () => {
      const { isActive: _isActive, ...activeLostOption } = lostOption;

      expect(
        convertBulkTextToOptions({
          text: 'New\nScreening\nPartner\nLost!',
          currentOptions,
          nonRemovableOptionIds: applicationOptionIds,
        }),
      ).toEqual([
        newOption,
        screeningOption,
        partnerOption,
        { ...activeLostOption, label: 'Lost!' },
      ]);
    });

    it('reactivates an inactive option whose label is listed again', () => {
      const { isActive: _isActive, ...activeLostOption } = lostOption;

      expect(
        convertBulkTextToOptions({
          text: 'Lost\nNew\nScreening\nPartner',
          currentOptions,
          nonRemovableOptionIds: applicationOptionIds,
        }),
      ).toEqual([
        { ...activeLostOption, position: 0 },
        { ...newOption, position: 1 },
        { ...screeningOption, position: 2 },
        { ...partnerOption, position: 3 },
      ]);
    });
  });
});
