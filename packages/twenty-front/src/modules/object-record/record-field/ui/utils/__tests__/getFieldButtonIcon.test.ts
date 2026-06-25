import {
  linksFieldDefinition,
  richTextFieldDefinition,
  textfieldDefinition,
} from '@/object-record/record-field/ui/__mocks__/fieldDefinitions';
import { getFieldButtonIcon } from '@/object-record/record-field/ui/utils/getFieldButtonIcon';
import { IconPencil } from 'twenty-ui/icon';

describe('getFieldButtonIcon', () => {
  it('should return undefined when the field definition is undefined', () => {
    expect(getFieldButtonIcon(undefined)).toBeUndefined();
  });

  it('should return undefined when the field definition is null', () => {
    expect(getFieldButtonIcon(null)).toBeUndefined();
  });

  it('should return the pencil icon for rich text fields', () => {
    expect(getFieldButtonIcon(richTextFieldDefinition)).toBe(IconPencil);
  });

  it('should return the pencil icon for links fields', () => {
    expect(getFieldButtonIcon(linksFieldDefinition)).toBe(IconPencil);
  });

  it('should return undefined for text fields edited in place', () => {
    expect(getFieldButtonIcon(textfieldDefinition)).toBeUndefined();
  });
});
