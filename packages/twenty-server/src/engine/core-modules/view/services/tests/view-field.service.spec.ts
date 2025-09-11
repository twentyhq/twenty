import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { type Repository } from 'typeorm';

import { ViewFieldEntity } from 'src/engine/core-modules/view/entities/view-field.entity';
import {
  ViewFieldException,
  ViewFieldExceptionCode,
  ViewFieldExceptionMessageKey,
  generateViewFieldExceptionMessage,
  generateViewFieldUserFriendlyExceptionMessage,
} from 'src/engine/core-modules/view/exceptions/view-field.exception';
import { ViewFieldService } from 'src/engine/core-modules/view/services/view-field.service';

describe('ViewFieldService', () => {
  let viewFieldService: ViewFieldService;
  let viewFieldRepository: Repository<ViewFieldEntity>;

  const mockViewField = {
    id: 'view-field-id',
    fieldMetadataId: 'field-id',
    viewId: 'view-id',
    workspaceId: 'workspace-id',
    position: 0,
    isVisible: true,
    size: 100,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  } as ViewFieldEntity;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ViewFieldService,
        {
          provide: getRepositoryToken(ViewFieldEntity),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            softDelete: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    viewFieldService = module.get<ViewFieldService>(ViewFieldService);
    viewFieldRepository = module.get<Repository<ViewFieldEntity>>(
      getRepositoryToken(ViewFieldEntity),
    );
  });

  it('should be defined', () => {
    expect(viewFieldService).toBeDefined();
  });

  describe('findByWorkspaceId', () => {
    it('should return view fields for a workspace', async () => {
      const workspaceId = 'workspace-id';
      const expectedViewFields = [mockViewField];

      jest
        .spyOn(viewFieldRepository, 'find')
        .mockResolvedValue(expectedViewFields);

      const result = await viewFieldService.findByWorkspaceId(workspaceId);

      expect(viewFieldRepository.find).toHaveBeenCalledWith({
        where: {
          workspaceId,
          deletedAt: expect.anything(),
        },
        order: { position: 'ASC' },
        relations: ['workspace', 'view'],
      });
      expect(result).toEqual(expectedViewFields);
    });
  });

  describe('findByViewId', () => {
    it('should return view fields for a view', async () => {
      const workspaceId = 'workspace-id';
      const viewId = 'view-id';
      const expectedViewFields = [mockViewField];

      jest
        .spyOn(viewFieldRepository, 'find')
        .mockResolvedValue(expectedViewFields);

      const result = await viewFieldService.findByViewId(workspaceId, viewId);

      expect(viewFieldRepository.find).toHaveBeenCalledWith({
        where: {
          workspaceId,
          viewId,
          deletedAt: expect.anything(),
        },
        order: { position: 'ASC' },
        relations: ['workspace', 'view'],
      });
      expect(result).toEqual(expectedViewFields);
    });
  });

  describe('findById', () => {
    it('should return a view field by id', async () => {
      const id = 'view-field-id';
      const workspaceId = 'workspace-id';

      jest
        .spyOn(viewFieldRepository, 'findOne')
        .mockResolvedValue(mockViewField);

      const result = await viewFieldService.findById(id, workspaceId);

      expect(viewFieldRepository.findOne).toHaveBeenCalledWith({
        where: {
          id,
          workspaceId,
          deletedAt: expect.anything(),
        },
        relations: ['workspace', 'view'],
      });
      expect(result).toEqual(mockViewField);
    });

    it('should return null when view field is not found', async () => {
      const id = 'non-existent-id';
      const workspaceId = 'workspace-id';

      jest.spyOn(viewFieldRepository, 'findOne').mockResolvedValue(null);

      const result = await viewFieldService.findById(id, workspaceId);

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    const validViewFieldData = {
      fieldMetadataId: 'field-id',
      viewId: 'view-id',
      workspaceId: 'workspace-id',
      position: 0,
      isVisible: true,
      size: 100,
    };

    it('should throw exception when workspaceId is missing', async () => {
      const invalidData = { ...validViewFieldData, workspaceId: undefined };

      await expect(viewFieldService.create(invalidData)).rejects.toThrow(
        new ViewFieldException(
          generateViewFieldExceptionMessage(
            ViewFieldExceptionMessageKey.WORKSPACE_ID_REQUIRED,
          ),
          ViewFieldExceptionCode.INVALID_VIEW_FIELD_DATA,
          {
            userFriendlyMessage: generateViewFieldUserFriendlyExceptionMessage(
              ViewFieldExceptionMessageKey.WORKSPACE_ID_REQUIRED,
            ),
          },
        ),
      );
    });

    it('should throw exception when viewId is missing', async () => {
      const invalidData = { ...validViewFieldData, viewId: undefined };

      await expect(viewFieldService.create(invalidData)).rejects.toThrow(
        new ViewFieldException(
          generateViewFieldExceptionMessage(
            ViewFieldExceptionMessageKey.VIEW_ID_REQUIRED,
          ),
          ViewFieldExceptionCode.INVALID_VIEW_FIELD_DATA,
          {
            userFriendlyMessage: generateViewFieldUserFriendlyExceptionMessage(
              ViewFieldExceptionMessageKey.VIEW_ID_REQUIRED,
            ),
          },
        ),
      );
    });

    it('should throw exception when fieldMetadataId is missing', async () => {
      const invalidData = { ...validViewFieldData, fieldMetadataId: undefined };

      await expect(viewFieldService.create(invalidData)).rejects.toThrow(
        new ViewFieldException(
          generateViewFieldExceptionMessage(
            ViewFieldExceptionMessageKey.FIELD_METADATA_ID_REQUIRED,
          ),
          ViewFieldExceptionCode.INVALID_VIEW_FIELD_DATA,
          {
            userFriendlyMessage: generateViewFieldUserFriendlyExceptionMessage(
              ViewFieldExceptionMessageKey.FIELD_METADATA_ID_REQUIRED,
            ),
          },
        ),
      );
    });
  });

  describe('update', () => {
    it('should update a view field successfully', async () => {
      const id = 'view-field-id';
      const workspaceId = 'workspace-id';
      const updateData = { position: 1 };
      const updatedViewField = { ...mockViewField, ...updateData };

      jest.spyOn(viewFieldService, 'findById').mockResolvedValue(mockViewField);
      jest
        .spyOn(viewFieldRepository, 'save')
        .mockResolvedValue(updatedViewField);

      const result = await viewFieldService.update(id, workspaceId, updateData);

      expect(viewFieldService.findById).toHaveBeenCalledWith(id, workspaceId);
      expect(viewFieldRepository.save).toHaveBeenCalledWith({
        id,
        ...updateData,
      });
      expect(result).toEqual({ ...mockViewField, ...updatedViewField });
    });

    it('should throw exception when view field is not found', async () => {
      const id = 'non-existent-id';
      const workspaceId = 'workspace-id';
      const updateData = { position: 1 };

      jest.spyOn(viewFieldService, 'findById').mockResolvedValue(null);

      await expect(
        viewFieldService.update(id, workspaceId, updateData),
      ).rejects.toThrow(
        new ViewFieldException(
          generateViewFieldExceptionMessage(
            ViewFieldExceptionMessageKey.VIEW_FIELD_NOT_FOUND,
            id,
          ),
          ViewFieldExceptionCode.VIEW_FIELD_NOT_FOUND,
        ),
      );
    });
  });

  describe('delete', () => {
    it('should delete a view field successfully', async () => {
      const id = 'view-field-id';
      const workspaceId = 'workspace-id';

      jest.spyOn(viewFieldService, 'findById').mockResolvedValue(mockViewField);
      jest
        .spyOn(viewFieldRepository, 'softDelete')
        .mockResolvedValue({} as any);

      const result = await viewFieldService.delete(id, workspaceId);

      expect(viewFieldService.findById).toHaveBeenCalledWith(id, workspaceId);
      expect(viewFieldRepository.softDelete).toHaveBeenCalledWith(id);
      expect(result).toEqual(mockViewField);
    });

    it('should throw exception when view field is not found', async () => {
      const id = 'non-existent-id';
      const workspaceId = 'workspace-id';

      jest.spyOn(viewFieldService, 'findById').mockResolvedValue(null);

      await expect(viewFieldService.delete(id, workspaceId)).rejects.toThrow(
        new ViewFieldException(
          generateViewFieldExceptionMessage(
            ViewFieldExceptionMessageKey.VIEW_FIELD_NOT_FOUND,
            id,
          ),
          ViewFieldExceptionCode.VIEW_FIELD_NOT_FOUND,
        ),
      );
    });
  });

  describe('destroy', () => {
    it('should destroy a view field successfully', async () => {
      const id = 'view-field-id';
      const workspaceId = 'workspace-id';

      jest.spyOn(viewFieldService, 'findById').mockResolvedValue(mockViewField);
      jest.spyOn(viewFieldRepository, 'delete').mockResolvedValue({} as any);

      const result = await viewFieldService.destroy(id, workspaceId);

      expect(viewFieldService.findById).toHaveBeenCalledWith(id, workspaceId);
      expect(viewFieldRepository.delete).toHaveBeenCalledWith(id);
      expect(result).toBeDefined();
    });
  });
});
