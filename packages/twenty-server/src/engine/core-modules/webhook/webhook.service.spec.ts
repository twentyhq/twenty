import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { ArrayContains, IsNull } from 'typeorm';

import { WebhookEntity } from './webhook.entity';
import { WebhookException, WebhookExceptionCode } from './webhook.exception';
import { WebhookService } from './webhook.service';

describe('WebhookService', () => {
  let service: WebhookService;
  let mockWebhookRepository: any;

  const mockWorkspaceId = 'workspace-123';
  const mockWebhookId = 'webhook-456';

  const mockWebhook: WebhookEntity = {
    id: mockWebhookId,
    targetUrl: 'https://example.com/webhook',
    secret: 'webhook-secret',
    operations: ['create', 'update'],
    workspaceId: mockWorkspaceId,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    deletedAt: undefined,
    workspace: {} as any,
  };

  beforeEach(async () => {
    mockWebhookRepository = {
      find: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      softDelete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WebhookService,
        {
          provide: getRepositoryToken(WebhookEntity),
          useValue: mockWebhookRepository,
        },
      ],
    }).compile();

    service = module.get<WebhookService>(WebhookService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('normalizeTargetUrl', () => {
    it('should normalize valid URLs', () => {
      const result = (service as any).normalizeTargetUrl(
        'https://example.com/webhook',
      );

      expect(result).toBe('https://example.com/webhook');
    });

    it('should return original string if invalid URL', () => {
      const invalidUrl = 'not-a-url';
      const result = (service as any).normalizeTargetUrl(invalidUrl);

      expect(result).toBe(invalidUrl);
    });

    it('should normalize URL with trailing slash', () => {
      const result = (service as any).normalizeTargetUrl(
        'https://example.com/webhook/',
      );

      expect(result).toBe('https://example.com/webhook/');
    });
  });

  describe('validateTargetUrl', () => {
    it('should validate HTTPS URLs', () => {
      const result = (service as any).validateTargetUrl(
        'https://example.com/webhook',
      );

      expect(result).toBe(true);
    });

    it('should validate HTTP URLs', () => {
      const result = (service as any).validateTargetUrl(
        'http://example.com/webhook',
      );

      expect(result).toBe(true);
    });

    it('should reject invalid URLs', () => {
      const result = (service as any).validateTargetUrl('not-a-url');

      expect(result).toBe(false);
    });

    it('should reject non-HTTP protocols', () => {
      const result = (service as any).validateTargetUrl(
        'ftp://example.com/webhook',
      );

      expect(result).toBe(false);
    });
  });

  describe('findByWorkspaceId', () => {
    it('should find all webhooks for a workspace', async () => {
      const mockWebhooks = [
        mockWebhook,
        { ...mockWebhook, id: 'another-webhook' },
      ];

      mockWebhookRepository.find.mockResolvedValue(mockWebhooks);

      const result = await service.findByWorkspaceId(mockWorkspaceId);

      expect(mockWebhookRepository.find).toHaveBeenCalledWith({
        where: {
          workspaceId: mockWorkspaceId,
          deletedAt: IsNull(),
        },
      });
      expect(result).toEqual(mockWebhooks);
    });
  });

  describe('findByOperations', () => {
    it('should find webhooks by operations using ArrayContains', async () => {
      const operations = ['create', 'update'];
      const mockWebhooks = [mockWebhook];

      mockWebhookRepository.find.mockResolvedValue(mockWebhooks);

      const result = await service.findByOperations(
        mockWorkspaceId,
        operations,
      );

      expect(mockWebhookRepository.find).toHaveBeenCalledWith({
        where: operations.map((operation) => ({
          workspaceId: mockWorkspaceId,
          operations: ArrayContains([operation]),
          deletedAt: IsNull(),
        })),
      });
      expect(result).toEqual(mockWebhooks);
    });

    it('should handle single operation', async () => {
      const operations = ['create'];

      mockWebhookRepository.find.mockResolvedValue([mockWebhook]);

      const result = await service.findByOperations(
        mockWorkspaceId,
        operations,
      );

      expect(mockWebhookRepository.find).toHaveBeenCalledWith({
        where: [
          {
            workspaceId: mockWorkspaceId,
            operations: ArrayContains(['create']),
            deletedAt: IsNull(),
          },
        ],
      });
      expect(result).toEqual([mockWebhook]);
    });
  });

  describe('findById', () => {
    it('should find a webhook by ID and workspace ID', async () => {
      mockWebhookRepository.findOne.mockResolvedValue(mockWebhook);

      const result = await service.findById(mockWebhookId, mockWorkspaceId);

      expect(mockWebhookRepository.findOne).toHaveBeenCalledWith({
        where: {
          id: mockWebhookId,
          workspaceId: mockWorkspaceId,
          deletedAt: IsNull(),
        },
      });
      expect(result).toEqual(mockWebhook);
    });

    it('should return null if webhook not found', async () => {
      mockWebhookRepository.findOne.mockResolvedValue(null);

      const result = await service.findById('non-existent', mockWorkspaceId);

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create and save a webhook with valid target URL', async () => {
      const webhookData = {
        targetUrl: 'https://example.com/webhook',
        secret: 'webhook-secret',
        operations: ['create', 'update'],
        workspaceId: mockWorkspaceId,
      };

      mockWebhookRepository.create.mockReturnValue(mockWebhook);
      mockWebhookRepository.save.mockResolvedValue(mockWebhook);

      const result = await service.create(webhookData);

      expect(mockWebhookRepository.create).toHaveBeenCalledWith({
        ...webhookData,
        targetUrl: 'https://example.com/webhook',
        secret: 'webhook-secret',
      });
      expect(mockWebhookRepository.save).toHaveBeenCalledWith(mockWebhook);
      expect(result).toEqual(mockWebhook);
    });

    it('should throw WebhookException for invalid target URL', async () => {
      const webhookData = {
        targetUrl: 'invalid-url',
        operations: ['create'],
        workspaceId: mockWorkspaceId,
      };

      await expect(service.create(webhookData)).rejects.toThrow(
        WebhookException,
      );

      await expect(service.create(webhookData)).rejects.toMatchObject({
        code: WebhookExceptionCode.INVALID_TARGET_URL,
      });

      expect(mockWebhookRepository.create).not.toHaveBeenCalled();
      expect(mockWebhookRepository.save).not.toHaveBeenCalled();
    });

    it('should throw WebhookException for webhook data without target URL', async () => {
      const webhookData = {
        operations: ['create'],
        workspaceId: mockWorkspaceId,
      };

      await expect(service.create(webhookData)).rejects.toThrow(
        WebhookException,
      );

      await expect(service.create(webhookData)).rejects.toMatchObject({
        code: WebhookExceptionCode.INVALID_TARGET_URL,
      });
    });
  });

  describe('update', () => {
    it('should update an existing webhook', async () => {
      const updateData = { targetUrl: 'https://updated.example.com/webhook' };
      const updatedWebhook = { ...mockWebhook, ...updateData };

      mockWebhookRepository.findOne
        .mockResolvedValueOnce(mockWebhook)
        .mockResolvedValueOnce(updatedWebhook);
      mockWebhookRepository.update.mockResolvedValue({ affected: 1 });

      const result = await service.update(
        mockWebhookId,
        mockWorkspaceId,
        updateData,
      );

      expect(mockWebhookRepository.update).toHaveBeenCalledWith(
        mockWebhookId,
        updateData,
      );
      expect(result).toEqual(updatedWebhook);
    });

    it('should return null if webhook to update does not exist', async () => {
      mockWebhookRepository.findOne.mockResolvedValue(null);

      const result = await service.update('non-existent', mockWorkspaceId, {
        targetUrl: 'https://updated.example.com',
      });

      expect(mockWebhookRepository.update).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });

    it('should throw WebhookException for invalid target URL during update', async () => {
      const updateData = { targetUrl: 'invalid-url' };

      mockWebhookRepository.findOne.mockResolvedValue(mockWebhook);

      await expect(
        service.update(mockWebhookId, mockWorkspaceId, updateData),
      ).rejects.toThrow(WebhookException);

      await expect(
        service.update(mockWebhookId, mockWorkspaceId, updateData),
      ).rejects.toMatchObject({
        code: WebhookExceptionCode.INVALID_TARGET_URL,
      });

      expect(mockWebhookRepository.update).not.toHaveBeenCalled();
    });

    it('should update without target URL validation if targetUrl not in updateData', async () => {
      const updateData = { operations: ['create', 'update', 'delete'] };
      const updatedWebhook = { ...mockWebhook, ...updateData };

      mockWebhookRepository.findOne
        .mockResolvedValueOnce(mockWebhook)
        .mockResolvedValueOnce(updatedWebhook);
      mockWebhookRepository.update.mockResolvedValue({ affected: 1 });

      const result = await service.update(
        mockWebhookId,
        mockWorkspaceId,
        updateData,
      );

      expect(mockWebhookRepository.update).toHaveBeenCalledWith(
        mockWebhookId,
        updateData,
      );
      expect(result).toEqual(updatedWebhook);
    });
  });

  describe('delete', () => {
    it('should soft delete a webhook', async () => {
      mockWebhookRepository.findOne.mockResolvedValue(mockWebhook);
      mockWebhookRepository.softDelete.mockResolvedValue({ affected: 1 });

      const result = await service.delete(mockWebhookId, mockWorkspaceId);

      expect(mockWebhookRepository.findOne).toHaveBeenCalledWith({
        where: {
          id: mockWebhookId,
          workspaceId: mockWorkspaceId,
          deletedAt: IsNull(),
        },
      });
      expect(mockWebhookRepository.softDelete).toHaveBeenCalledWith(
        mockWebhookId,
      );
      expect(result).toEqual(mockWebhook);
    });

    it('should return null if webhook to delete does not exist', async () => {
      mockWebhookRepository.findOne.mockResolvedValue(null);

      const result = await service.delete('non-existent', mockWorkspaceId);

      expect(mockWebhookRepository.softDelete).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });
  });

  describe('edge cases', () => {
    it('should handle URLs with query parameters', async () => {
      const webhookData = {
        targetUrl: 'https://example.com/webhook?param=value',
        operations: ['create'],
        workspaceId: mockWorkspaceId,
      };

      const normalizedWebhook = {
        ...mockWebhook,
        targetUrl: 'https://example.com/webhook?param=value',
      };

      mockWebhookRepository.create.mockReturnValue(normalizedWebhook);
      mockWebhookRepository.save.mockResolvedValue(normalizedWebhook);

      const result = await service.create(webhookData);

      expect(result.targetUrl).toBe('https://example.com/webhook?param=value');
    });

    it('should handle URLs with fragments', async () => {
      const webhookData = {
        targetUrl: 'https://example.com/webhook#section',
        operations: ['create'],
        workspaceId: mockWorkspaceId,
      };

      const normalizedWebhook = {
        ...mockWebhook,
        targetUrl: 'https://example.com/webhook#section',
      };

      mockWebhookRepository.create.mockReturnValue(normalizedWebhook);
      mockWebhookRepository.save.mockResolvedValue(normalizedWebhook);

      const result = await service.create(webhookData);

      expect(result.targetUrl).toBe('https://example.com/webhook#section');
    });

    it('should handle empty operations array', async () => {
      await service.findByOperations(mockWorkspaceId, []);

      expect(mockWebhookRepository.find).toHaveBeenCalledWith({
        where: [],
      });
    });
  });
});
