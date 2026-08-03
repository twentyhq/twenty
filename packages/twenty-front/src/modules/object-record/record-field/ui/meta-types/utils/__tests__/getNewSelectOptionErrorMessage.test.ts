import { type FieldMetadataItemOption } from '@/object-metadata/types/FieldMetadataItem';
import { getNewSelectOptionErrorMessage } from '@/object-record/record-field/ui/meta-types/utils/getNewSelectOptionErrorMessage';
import { computeOptionValueFromLabel } from '~/pages/settings/data-model/utils/computeOptionValueFromLabel';

const currentOptions = [
  { id: '1', label: 'Robotics', value: 'ROBOTICS', color: 'blue', position: 0 },
  { id: '2', label: 'AI/ML', value: 'AI_ML', color: 'red', position: 1 },
] satisfies FieldMetadataItemOption[];

const getErrorMessage = (optionName: string) =>
  getNewSelectOptionErrorMessage({
    optionName,
    newOptionValue: computeOptionValueFromLabel(optionName),
    currentOptions,
  });

describe('getNewSelectOptionErrorMessage', () => {
  it('accepts a name that does not collide', () => {
    expect(getErrorMessage('Fusion')).toBeUndefined();
  });

  it('rejects a name whose derived value collides with an existing option', () => {
    // "AI / ML" and "AI/ML" both normalize to AI_ML, so the labels differ but
    // the enum members would not.
    expect(getErrorMessage('AI / ML')).toMatch(/already exists/);
  });

  it('rejects a name that produces no usable value', () => {
    expect(getErrorMessage('🚀')).toMatch(/cannot be used/);
  });

  it('rejects a name containing a comma', () => {
    expect(getErrorMessage('Health, Medicine')).toMatch(/comma/);
  });

  it('rejects a name longer than the identifier limit', () => {
    expect(getErrorMessage('a'.repeat(64))).toMatch(/limited to/);
  });
});
