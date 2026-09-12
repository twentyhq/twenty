import { describe, expect, it } from 'vitest';

import { computeGranolaFolderTree } from 'src/front-components/utils/compute-granola-folder-tree.util';

const toNames = (
  nodes: ReturnType<typeof computeGranolaFolderTree>,
): unknown[] => nodes.map((node) => [node.folder.name, toNames(node.children)]);

describe('computeGranolaFolderTree', () => {
  it('nests children under their parent sorted by name at every level', () => {
    expect(
      toNames(
        computeGranolaFolderTree([
          { id: 'child', name: 'Calls', parent_folder_id: 'parent' },
          { id: 'sibling', name: 'Sales - EMEA', parent_folder_id: null },
          { id: 'root', name: 'Sales', parent_folder_id: null },
          { id: 'parent', name: 'Europe', parent_folder_id: 'root' },
          { id: 'asia', name: 'Asia', parent_folder_id: 'root' },
        ]),
      ),
    ).toEqual([
      [
        'Sales',
        [
          ['Asia', []],
          ['Europe', [['Calls', []]]],
        ],
      ],
      ['Sales - EMEA', []],
    ]);
  });

  it('lifts folders with an inaccessible parent or cyclic ancestry to the top level', () => {
    expect(
      toNames(
        computeGranolaFolderTree([
          { id: 'orphan', name: 'Calls', parent_folder_id: 'missing' },
          { id: 'self', name: 'Team', parent_folder_id: 'self' },
          { id: 'first', name: 'Loop A', parent_folder_id: 'second' },
          { id: 'second', name: 'Loop B', parent_folder_id: 'first' },
        ]),
      ),
    ).toEqual([
      ['Calls', []],
      ['Team', []],
      ['Loop A', [['Loop B', []]]],
    ]);
  });
});
