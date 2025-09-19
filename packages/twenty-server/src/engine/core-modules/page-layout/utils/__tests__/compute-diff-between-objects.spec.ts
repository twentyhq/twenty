import { computeDiffBetweenObjects } from 'src/engine/core-modules/page-layout/utils/compute-diff-between-objects';

describe('computeDiffBetweenObjects', () => {
  it('should return the correct diff', () => {
    const existingObjects = [
      { id: '1', name: 'Object 1' },
      { id: '2', name: 'Object 2' },
    ];
    const receivedObjects = [
      { id: '1', name: 'Object 1' },
      { id: '3', name: 'Object 3' },
    ];

    const diff = computeDiffBetweenObjects({
      existingObjects,
      receivedObjects,
      propertiesToCompare: ['name'],
    });

    expect(diff).toEqual({
      toCreate: [{ id: '3', name: 'Object 3' }],
      toUpdate: [],
      idsToDelete: ['2'],
    });
  });

  it('should return the correct diff when the properties to compare are empty', () => {
    const existingObjects = [{ id: '1', name: 'Object 1' }];
    const receivedObjects = [{ id: '1', name: 'Object 1' }];

    const diff = computeDiffBetweenObjects({
      existingObjects,
      receivedObjects,
      propertiesToCompare: [],
    });

    expect(diff).toEqual({
      toCreate: [],
      toUpdate: [],
      idsToDelete: [],
    });
  });

  it('should return the correct diff when the existing objects are empty', () => {
    const existingObjects: { id: string; name: string }[] = [];
    const receivedObjects = [{ id: '1', name: 'Object 1' }];

    const diff = computeDiffBetweenObjects({
      existingObjects,
      receivedObjects,
      propertiesToCompare: ['name'],
    });

    expect(diff).toEqual({
      toCreate: [{ id: '1', name: 'Object 1' }],
      toUpdate: [],
      idsToDelete: [],
    });
  });

  it('should return the correct diff when the received objects are empty', () => {
    const existingObjects = [{ id: '1', name: 'Object 1' }];
    const receivedObjects: { id: string; name: string }[] = [];

    const diff = computeDiffBetweenObjects({
      existingObjects,
      receivedObjects,
      propertiesToCompare: ['name'],
    });

    expect(diff).toEqual({
      toCreate: [],
      toUpdate: [],
      idsToDelete: ['1'],
    });
  });
});
