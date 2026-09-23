import { type z } from 'zod';

import { type inventoryFindingSchema } from '../../schemas/inventoryFindingSchema';
import { mergeInventoryFindings } from '../mergeInventoryFindings';

type InventoryFinding = z.infer<typeof inventoryFindingSchema>;

const REACT_MEMBER_FINDING: InventoryFinding = {
  scope: 'member',
  id: 'window.fetch',
  targetId: 'window',
  runtimes: ['react'],
  observation: 'present-behavior-unverified',
  behavior: 'unverified',
  isPlacementDifferent: false,
  isDescriptorDifferent: false,
};

const REACT_TARGET_FINDING: InventoryFinding = {
  scope: 'target',
  id: 'globalThis.MouseEvent',
  targetId: 'globalThis.MouseEvent',
  runtimes: ['react'],
  observation: 'missing',
  reason: 'Target is absent or is not an object',
  memberCount: 12,
};

describe('mergeInventoryFindings', () => {
  it('merges findings that every runtime shares', () => {
    expect(
      mergeInventoryFindings([
        REACT_MEMBER_FINDING,
        REACT_TARGET_FINDING,
        { ...REACT_MEMBER_FINDING, runtimes: ['preact'] },
        { ...REACT_TARGET_FINDING, runtimes: ['preact'] },
      ]),
    ).toEqual([
      { ...REACT_MEMBER_FINDING, runtimes: ['react', 'preact'] },
      { ...REACT_TARGET_FINDING, runtimes: ['react', 'preact'] },
    ]);
  });

  it('keeps findings that differ between runtimes separate', () => {
    const preactFinding: InventoryFinding = {
      ...REACT_MEMBER_FINDING,
      runtimes: ['preact'],
      observation: 'missing',
    };
    expect(
      mergeInventoryFindings([REACT_MEMBER_FINDING, preactFinding]),
    ).toEqual([REACT_MEMBER_FINDING, preactFinding]);
  });

  it('does not mutate the findings it merges', () => {
    const preactFinding: InventoryFinding = {
      ...REACT_MEMBER_FINDING,
      runtimes: ['preact'],
    };
    mergeInventoryFindings([REACT_MEMBER_FINDING, preactFinding]);
    expect(REACT_MEMBER_FINDING.runtimes).toEqual(['react']);
  });
});
