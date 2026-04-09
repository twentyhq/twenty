let uuidCounter = 0;

jest.mock('uuid', () => ({
  v4: jest.fn(
    () => `00000000-0000-0000-0000-${String(++uuidCounter).padStart(12, '0')}`,
  ),
}));

import { getStandardObjectMetadataRelatedEntityIds } from 'src/engine/workspace-manager/twenty-standard-application/utils/get-standard-object-metadata-related-entity-ids.util';

describe('getStandardObjectMetadataRelatedEntityIds', () => {
  beforeEach(() => {
    uuidCounter = 0;
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it('should return standard object metadata related entity ids', () => {
    const result = getStandardObjectMetadataRelatedEntityIds();

    expect(result).toMatchSnapshot();
  });
});
