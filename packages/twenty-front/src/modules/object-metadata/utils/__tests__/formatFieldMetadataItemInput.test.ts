import { FieldMetadataItemOption } from '@/object-metadata/types/FieldMetadataItem';
import { FieldMetadataType } from '~/generated-metadata/graphql';

import { formatFieldMetadataItemInput } from '../formatFieldMetadataItemInput';

describe('formatFieldMetadataItemInput', () => {
  it('should format the field metadata item input correctly', () => {
    const options: FieldMetadataItemOption[] = [
      {
        id: '1',
        label: 'Option 1',
        color: 'red' as const,
        position: 0,
        value: 'OPTION_1',
      },
      {
        id: '2',
        label: 'Option 2',
        color: 'blue' as const,
        position: 1,
        value: 'OPTION_2',
      },
    ];
    const input = {
      defaultValue: "'OPTION_1'",
      label: 'Example Label',
      icon: 'example-icon',
      type: FieldMetadataType.Select,
      description: 'Example description',
      options,
    };

    const expected = {
      description: 'Example description',
      icon: 'example-icon',
      label: 'Example Label',
      name: 'exampleLabel',
      options,
      defaultValue: "'OPTION_1'",
    };

    const result = formatFieldMetadataItemInput(input);

    expect(result).toEqual(expected);
  });

  it('should handle input without options', () => {
    const input = {
      label: 'Example Label',
      icon: 'example-icon',
      type: FieldMetadataType.Select,
      description: 'Example description',
    };

    const expected = {
      description: 'Example description',
      icon: 'example-icon',
      label: 'Example Label',
      name: 'exampleLabel',
      options: undefined,
      defaultValue: undefined,
    };

    const result = formatFieldMetadataItemInput(input);

    expect(result).toEqual(expected);
  });

  it('should format the field metadata item multi select input correctly', () => {
    const options: FieldMetadataItemOption[] = [
      {
        id: '1',
        label: 'Option 1',
        color: 'red' as const,
        position: 0,
        value: 'OPTION_1',
      },
      {
        id: '2',
        label: 'Option 2',
        color: 'blue' as const,
        position: 1,
        value: 'OPTION_2',
      },
    ];
    const input = {
      defaultValue: ["'OPTION_1'", "'OPTION_2'"],
      label: 'Example Label',
      icon: 'example-icon',
      type: FieldMetadataType.MultiSelect,
      description: 'Example description',
      options,
    };

    const expected = {
      description: 'Example description',
      icon: 'example-icon',
      label: 'Example Label',
      name: 'exampleLabel',
      options,
      defaultValue: ["'OPTION_1'", "'OPTION_2'"],
    };

    const result = formatFieldMetadataItemInput(input);

    expect(result).toEqual(expected);
  });

  it('should handle multi select input without options', () => {
    const input = {
      label: 'Example Label',
      icon: 'example-icon',
      type: FieldMetadataType.MultiSelect,
      description: 'Example description',
    };

    const expected = {
      description: 'Example description',
      icon: 'example-icon',
      label: 'Example Label',
      name: 'exampleLabel',
      options: undefined,
      defaultValue: undefined,
    };

    const result = formatFieldMetadataItemInput(input);

    expect(result).toEqual(expected);
  });
});
