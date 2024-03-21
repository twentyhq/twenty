jest.mock('@/object-record/hooks/useFindManyRecords', () => ({
  useFindManyRecords: jest.fn(),
}));

describe('useEvent', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  // TODO
});
