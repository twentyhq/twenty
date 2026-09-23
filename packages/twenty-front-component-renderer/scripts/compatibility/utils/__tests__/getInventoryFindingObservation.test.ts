import { type z } from 'zod';

import { type inventoryFindingSchema } from '../../schemas/inventoryFindingSchema';
import { type inventoryMemberSchema } from '../../schemas/inventoryMemberSchema';
import { getInventoryFindingObservation } from '../getInventoryFindingObservation';

type InventoryMemberObservation = z.infer<
  typeof inventoryMemberSchema
>['observation'];

const createAccessor = ({
  getter,
  setter,
}: {
  getter: boolean;
  setter: boolean;
}): InventoryMemberObservation => ({
  shape: 'accessor',
  depth: 0,
  enumerable: true,
  configurable: true,
  getter,
  setter,
});

const createValue = (
  valueType: Extract<
    InventoryMemberObservation,
    { shape: 'value' | 'callable' }
  >['valueType'],
): InventoryMemberObservation => ({
  shape: 'value',
  depth: 0,
  enumerable: true,
  configurable: true,
  writable: true,
  valueType,
});

const CALLABLE_OBSERVATION: InventoryMemberObservation = {
  shape: 'callable',
  depth: 0,
  enumerable: true,
  configurable: true,
  writable: true,
  valueType: 'function',
};

describe('getInventoryFindingObservation', () => {
  it.each<
    [
      string,
      InventoryMemberObservation,
      InventoryMemberObservation,
      z.infer<typeof inventoryFindingSchema>['observation'],
    ]
  >([
    [
      'an accessor that lost its setter',
      createAccessor({ getter: true, setter: true }),
      createAccessor({ getter: true, setter: false }),
      'shape-mismatch',
    ],
    [
      'an accessor that lost its getter',
      createAccessor({ getter: true, setter: false }),
      createAccessor({ getter: false, setter: false }),
      'shape-mismatch',
    ],
    [
      'a value of another type',
      createValue('number'),
      createValue('string'),
      'shape-mismatch',
    ],
    [
      'a callable replaced by an object value',
      CALLABLE_OBSERVATION,
      createValue('object'),
      'shape-mismatch',
    ],
    [
      'a callable served through an accessor',
      CALLABLE_OBSERVATION,
      createAccessor({ getter: true, setter: false }),
      'shape-mismatch',
    ],
    [
      'matching accessors',
      createAccessor({ getter: true, setter: true }),
      createAccessor({ getter: true, setter: true }),
      'present-behavior-unverified',
    ],
    [
      'values of the same type',
      createValue('number'),
      createValue('number'),
      'present-behavior-unverified',
    ],
    [
      'an uninspectable reference member',
      { shape: 'uninspectable', reason: 'No descriptor' },
      CALLABLE_OBSERVATION,
      'uninspectable',
    ],
    [
      'a missing sandbox member',
      CALLABLE_OBSERVATION,
      { shape: 'missing' },
      'missing',
    ],
    [
      'an uninspectable sandbox member',
      CALLABLE_OBSERVATION,
      { shape: 'uninspectable', reason: 'No descriptor' },
      'uninspectable',
    ],
  ])('classifies %s', (_description, reference, sandbox, observation) => {
    expect(getInventoryFindingObservation({ reference, sandbox })).toBe(
      observation,
    );
  });
});
