import { Test, TestingModule } from '@nestjs/testing';
import { HttpModule, HttpService } from '@nestjs/axios';
import { of, throwError } from 'rxjs';
import {
  AxiosResponse,
  AxiosError,
  InternalAxiosRequestConfig,
} from 'axios';

import { AILayerService } from '../ai-layer.service';

describe('AILayerService', () => {
  let service: AILayerService;
  let httpService: HttpService;

  beforeEach(async () => {
    // Set up environment variables for testing
    process.env.CTX_MCP_URL = 'http://ctx-mcp:3100';
    process.env.AI_LAYER_ERROR_ENDPOINT =
      'http://ctx-mcp:3100/api/errors/report';
    process.env.AI_LAYER_ERROR_REPORTING_ENABLED = 'true';

    const module: TestingModule = await Test.createTestingModule({
      imports: [HttpModule],
      providers: [AILayerService],
    }).compile();

    service = module.get<AILayerService>(AILayerService);
    httpService = module.get<HttpService>(HttpService);
  });

  afterEach(() => {
    // Clean up environment variables
    delete process.env.CTX_MCP_URL;
    delete process.env.AI_LAYER_ERROR_ENDPOINT;
    delete process.env.AI_LAYER_ERROR_REPORTING_ENABLED;
  });

  describe('reportError', () => {
    it('should send error to ctx-mcp error endpoint', async () => {
      const mockResponse: AxiosResponse = {
        data: { success: true, recorded_at: '2026-01-13T00:00:00Z' },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as InternalAxiosRequestConfig,
      };

      jest.spyOn(httpService, 'post').mockReturnValue(of(mockResponse));

      const result = await service.reportError({
        workspace_id: 'ws_test',
        profile_id: 'prf_test',
        error_type: 'TestError',
        error_message: 'Test error message',
        criticality: 'error',
      });

      expect(result.success).toBe(true);
      expect(httpService.post).toHaveBeenCalledWith(
        'http://ctx-mcp:3100/api/errors/report',
        expect.objectContaining({
          workspace_id: 'ws_test',
          profile_id: 'prf_test',
          error_type: 'TestError',
        }),
        expect.any(Object),
      );
    });

    it('should handle connection errors gracefully', async () => {
      const axiosError = new AxiosError('Connection refused');

      jest
        .spyOn(httpService, 'post')
        .mockReturnValue(throwError(() => axiosError));

      const result = await service.reportError({
        workspace_id: 'ws_test',
        profile_id: 'prf_test',
        error_type: 'TestError',
        error_message: 'Test error message',
        criticality: 'error',
      });

      // Should not throw, should return graceful failure
      expect(result.success).toBe(false);
      expect(result.error).toContain('Connection refused');
    });

    it('should skip reporting when disabled', async () => {
      process.env.AI_LAYER_ERROR_REPORTING_ENABLED = 'false';

      const postSpy = jest.spyOn(httpService, 'post');

      const result = await service.reportError({
        workspace_id: 'ws_test',
        profile_id: 'prf_test',
        error_type: 'TestError',
        error_message: 'Test error message',
        criticality: 'error',
      });

      expect(result.success).toBe(true);
      expect(result.error).toBe('Error reporting disabled');
      expect(postSpy).not.toHaveBeenCalled();
    });
  });

  describe('checkHealth', () => {
    it('should return healthy when ctx-mcp responds', async () => {
      const mockResponse: AxiosResponse = {
        data: { status: 'healthy' },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as InternalAxiosRequestConfig,
      };

      jest.spyOn(httpService, 'get').mockReturnValue(of(mockResponse));

      const result = await service.checkHealth();

      expect(result.ctxMcp).toBe(true);
      expect(result.kbMcp).toBe(true);
      expect(result.n8n).toBe(true);
      expect(result.timestamp).toBeInstanceOf(Date);
    });

    it('should return unhealthy when services are down', async () => {
      const axiosError = new AxiosError('Connection refused');

      jest
        .spyOn(httpService, 'get')
        .mockReturnValue(throwError(() => axiosError));

      const result = await service.checkHealth();

      expect(result.ctxMcp).toBe(false);
      expect(result.kbMcp).toBe(false);
      expect(result.n8n).toBe(false);
    });
  });

  describe('getContext', () => {
    it('should call ctx-mcp with correct parameters', async () => {
      const mockResponse: AxiosResponse = {
        data: {
          result: {
            mode: 'business',
            indices: { engagement_score: 75 },
          },
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as InternalAxiosRequestConfig,
      };

      jest.spyOn(httpService, 'post').mockReturnValue(of(mockResponse));

      const result = await service.getContext({
        workspace_id: 'ws_test',
        profile_id: 'prf_test',
        mode: 'full',
      });

      expect(result).toEqual({
        mode: 'business',
        indices: { engagement_score: 75 },
      });

      expect(httpService.post).toHaveBeenCalledWith(
        'http://ctx-mcp:3100/mcp',
        expect.objectContaining({
          method: 'tools/call',
          params: {
            name: 'ctx_get_context',
            arguments: {
              workspace_id: 'ws_test',
              profile_id: 'prf_test',
              mode: 'full',
            },
          },
        }),
      );
    });

    it('should return null when context retrieval fails', async () => {
      const axiosError = new AxiosError('Connection refused');

      jest
        .spyOn(httpService, 'post')
        .mockReturnValue(throwError(() => axiosError));

      const result = await service.getContext({
        workspace_id: 'ws_test',
        profile_id: 'prf_test',
      });

      expect(result).toBeNull();
    });
  });
});
