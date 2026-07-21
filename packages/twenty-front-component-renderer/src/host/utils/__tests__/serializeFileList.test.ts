import { serializeFileList } from '../serializeFileList';

const validFile = {
  name: 'report.csv',
  size: 42,
  type: 'text/csv',
  lastModified: 1700000000000,
};

describe('serializeFileList', () => {
  it('should return undefined for a non-object', () => {
    expect(serializeFileList(null)).toBeUndefined();
    expect(serializeFileList('files')).toBeUndefined();
  });

  it('should return undefined when there is no numeric length', () => {
    expect(serializeFileList({})).toBeUndefined();
  });

  it('should serialize only the safe metadata of each file', () => {
    const result = serializeFileList({
      length: 1,
      0: { ...validFile, arrayBuffer: () => {} },
    });

    expect(result).toEqual([validFile]);
  });

  it('should skip entries missing required fields', () => {
    const result = serializeFileList({
      length: 2,
      0: validFile,
      1: { name: 'incomplete' },
    });

    expect(result).toEqual([validFile]);
  });
});
