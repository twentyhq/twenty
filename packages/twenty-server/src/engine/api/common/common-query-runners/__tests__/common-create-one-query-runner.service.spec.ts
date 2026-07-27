import { CommonCreateOneQueryRunnerService } from 'src/engine/api/common/common-query-runners/common-create-one-query-runner.service';

describe('CommonCreateOneQueryRunnerService', () => {
  let service: CommonCreateOneQueryRunnerService;
  let mockCommonCreateManyQueryRunnerService: { run: jest.Mock };

  beforeEach(() => {
    mockCommonCreateManyQueryRunnerService = {
      run: jest.fn().mockResolvedValue([{ id: '1', name: 'Test Record' }]),
    };

    service = new CommonCreateOneQueryRunnerService(
      mockCommonCreateManyQueryRunnerService as any,
    );
  });

  it('should forward upsert flag to commonCreateManyQueryRunnerService.run', async () => {
    const mockArgs = {
      data: { name: 'Test Record' },
      upsert: true,
    };
    const mockContext = {};

    const result = await service.run(mockArgs as any, mockContext as any);

    expect(mockCommonCreateManyQueryRunnerService.run).toHaveBeenCalledWith(
      {
        ...mockArgs,
        data: [mockArgs.data],
        upsert: true,
      },
      mockContext,
    );
    expect(result).toEqual({ id: '1', name: 'Test Record' });
  });
});
