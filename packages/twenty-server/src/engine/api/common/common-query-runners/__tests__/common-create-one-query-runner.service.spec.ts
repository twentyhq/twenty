import { CommonCreateOneQueryRunnerService } from 'src/engine/api/common/common-query-runners/common-create-one-query-runner.service';

describe('CommonCreateOneQueryRunnerService', () => {
  let service: CommonCreateOneQueryRunnerService;
  let mockCommonCreateManyQueryRunnerService: { run: jest.Mock };
  let mockDataArgProcessor: { process: jest.Mock };

  beforeEach(() => {
    mockCommonCreateManyQueryRunnerService = {
      run: jest.fn().mockResolvedValue([{ id: '1', name: 'Test Record' }]),
    };

    mockDataArgProcessor = {
      process: jest.fn().mockResolvedValue([{ id: '1', name: 'Test Record' }]),
    };

    service = new CommonCreateOneQueryRunnerService(
      mockCommonCreateManyQueryRunnerService as any,
    );

    (service as any).dataArgProcessor = mockDataArgProcessor;
  });

  describe('run', () => {
    it('should forward upsert: true flag to commonCreateManyQueryRunnerService.run', async () => {
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

    it('should forward upsert: false flag to commonCreateManyQueryRunnerService.run', async () => {
      const mockArgs = {
        data: { name: 'Test Record' },
        upsert: false,
      };
      const mockContext = {};

      const result = await service.run(mockArgs as any, mockContext as any);

      expect(mockCommonCreateManyQueryRunnerService.run).toHaveBeenCalledWith(
        {
          ...mockArgs,
          data: [mockArgs.data],
          upsert: false,
        },
        mockContext,
      );
      expect(result).toEqual({ id: '1', name: 'Test Record' });
    });
  });

  describe('computeArgs', () => {
    it('should pass shouldBackfillPositionIfUndefined: false when upsert is true', async () => {
      const mockArgs = {
        data: { name: 'Test Record' },
        upsert: true,
      };
      const mockContext = {
        authContext: {},
        flatObjectMetadata: {},
        flatFieldMetadataMaps: {},
        flatObjectMetadataMaps: {},
      };

      const result = await service.computeArgs(
        mockArgs as any,
        mockContext as any,
      );

      expect(mockDataArgProcessor.process).toHaveBeenCalledWith({
        partialRecordInputs: [mockArgs.data],
        authContext: mockContext.authContext,
        flatObjectMetadata: mockContext.flatObjectMetadata,
        flatFieldMetadataMaps: mockContext.flatFieldMetadataMaps,
        flatObjectMetadataMaps: mockContext.flatObjectMetadataMaps,
        shouldBackfillPositionIfUndefined: false,
      });
      expect(result).toEqual({
        ...mockArgs,
        data: { id: '1', name: 'Test Record' },
      });
    });

    it('should pass shouldBackfillPositionIfUndefined: true when upsert is false or undefined', async () => {
      const mockArgs = {
        data: { name: 'Test Record' },
      };
      const mockContext = {
        authContext: {},
        flatObjectMetadata: {},
        flatFieldMetadataMaps: {},
        flatObjectMetadataMaps: {},
      };

      const result = await service.computeArgs(
        mockArgs as any,
        mockContext as any,
      );

      expect(mockDataArgProcessor.process).toHaveBeenCalledWith({
        partialRecordInputs: [mockArgs.data],
        authContext: mockContext.authContext,
        flatObjectMetadata: mockContext.flatObjectMetadata,
        flatFieldMetadataMaps: mockContext.flatFieldMetadataMaps,
        flatObjectMetadataMaps: mockContext.flatObjectMetadataMaps,
        shouldBackfillPositionIfUndefined: true,
      });
      expect(result).toEqual({
        ...mockArgs,
        data: { id: '1', name: 'Test Record' },
      });
    });
  });
});
