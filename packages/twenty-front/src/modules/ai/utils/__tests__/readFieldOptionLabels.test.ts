import { type FieldDefinition } from '@/object-record/record-field/ui/types/FieldDefinition';
import { type FieldMetadata } from '@/object-record/record-field/ui/types/FieldMetadata';
import { readFieldOptionLabels } from '@/ai/utils/readFieldOptionLabels';
import { FieldMetadataType } from '~/generated-metadata/graphql';

const STAGE_OPTIONS = [
  { label: 'Proposal', value: 'PROPOSAL', color: 'red' as const },
  { label: 'Customer', value: 'CUSTOMER', color: 'green' as const },
];

const buildField = (type: FieldMetadataType) =>
  ({
    type,
    metadata: { options: STAGE_OPTIONS },
  }) as unknown as FieldDefinition<FieldMetadata>;

describe('readFieldOptionLabels', () => {
  it('reads a select value as its option label', () => {
    expect(
      readFieldOptionLabels(buildField(FieldMetadataType.SELECT), 'PROPOSAL'),
    ).toBe('Proposal');
  });

  it('reads each multi-select value as its option label', () => {
    expect(
      readFieldOptionLabels(buildField(FieldMetadataType.MULTI_SELECT), [
        'PROPOSAL',
        'CUSTOMER',
      ]),
    ).toEqual(['Proposal', 'Customer']);
  });

  it('keeps a value that matches no option', () => {
    expect(
      readFieldOptionLabels(buildField(FieldMetadataType.SELECT), 'LOST'),
    ).toBe('LOST');
  });

  it('leaves other field types as they are', () => {
    expect(
      readFieldOptionLabels(buildField(FieldMetadataType.TEXT), 'PROPOSAL'),
    ).toBe('PROPOSAL');
  });
});
