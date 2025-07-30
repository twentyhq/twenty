import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { ViewGroup } from 'src/engine/core-modules/view/entities/view-group.entity';
import {
  ViewGroupException,
  ViewGroupExceptionCode,
} from 'src/engine/core-modules/view/exceptions/view-group.exception';
import { ViewGroupService } from 'src/engine/core-modules/view/services/view-group.service';

describe('ViewGroupService', () => {
  let viewGroupService: ViewGroupService;
  let viewGroupRepository: Repository<ViewGroup>;

  const mockViewGroup = {
    id: 'view-group-id',
    fieldMetadataId: 'field-id',
    viewId: 'view-id',
    workspaceId: 'workspace-id',
    fieldValue: 'group-value',
    isVisible: true,
    position: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  } as ViewGroup;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ViewGroupService,
        {
          provide: getRepositoryToken(ViewGroup, 'core'),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            softDelete: jest.fn(),
          },
        },
      ],
    }).compile();

    viewGroupService = module.get<ViewGroupService>(ViewGroupService);
    viewGroupRepository = module.get<Repository<ViewGroup>>(
      getRepositoryToken(ViewGroup, 'core'),
    );
  });

  it('should be defined', () => {
    expect(viewGroupService).toBeDefined();
  });

  describe('findByWorkspaceId', () => {
    it('should return view groups for a workspace', async () => {
      const workspaceId = 'workspace-id';
      const expectedViewGroups = [mockViewGroup];

      jest
        .spyOn(viewGroupRepository, 'find')
        .mockResolvedValue(expectedViewGroups);

      const result = await viewGroupService.findByWorkspaceId(workspaceId);

      expect(viewGroupRepository.find).toHaveBeenCalledWith({
        where: {
          workspaceId,
          deletedAt: expect.anything(),
        },
        order: { position: 'ASC' },
      });
      expect(result).toEqual(expectedViewGroups);
    });
  });

  describe('findByViewId', () => {
    it('should return view groups for a view', async () => {
      const workspaceId = 'workspace-id';
      const viewId = 'view-id';
      const expectedViewGroups = [mockViewGroup];

      jest
        .spyOn(viewGroupRepository, 'find')
        .mockResolvedValue(expectedViewGroups);

      const result = await viewGroupService.findByViewId(workspaceId, viewId);

      expect(viewGroupRepository.find).toHaveBeenCalledWith({
        where: {
          workspaceId,
          viewId,
          deletedAt: expect.anything(),
        },
        order: { position: 'ASC' },
      });
      expect(result).toEqual(expectedViewGroups);
    });
  });

  describe('findById', () => {
    it('should return a view group by id', async () => {
      const id = 'view-group-id';
      const workspaceId = 'workspace-id';

      jest
        .spyOn(viewGroupRepository, 'findOne')
        .mockResolvedValue(mockViewGroup);

      const result = await viewGroupService.findById(id, workspaceId);

      expect(viewGroupRepository.findOne).toHaveBeenCalledWith({
        where: {
          id,
          workspaceId,
          deletedAt: expect.anything(),
        },
      });
      expect(result).toEqual(mockViewGroup);
    });

    it('should return null when view group is not found', async () => {
      const id = 'non-existent-id';
      const workspaceId = 'workspace-id';

      jest.spyOn(viewGroupRepository, 'findOne').mockResolvedValue(null);

      const result = await viewGroupService.findById(id, workspaceId);

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    const validViewGroupData = {
      fieldMetadataId: 'field-id',
      viewId: 'view-id',
      workspaceId: 'workspace-id',
      fieldValue: 'group-value',
      isVisible: true,
      position: 0,
    };

    it('should create a view group successfully', async () => {
      jest.spyOn(viewGroupRepository, 'create').mockReturnValue(mockViewGroup);
      jest.spyOn(viewGroupRepository, 'save').mockResolvedValue(mockViewGroup);

      const result = await viewGroupService.create(validViewGroupData);

      expect(viewGroupRepository.create).toHaveBeenCalledWith(
        validViewGroupData,
      );
      expect(viewGroupRepository.save).toHaveBeenCalledWith(mockViewGroup);
      expect(result).toEqual(mockViewGroup);
    });

    it('should throw exception when workspaceId is missing', async () => {
      const invalidData = { ...validViewGroupData, workspaceId: undefined };

      await expect(viewGroupService.create(invalidData)).rejects.toThrow(
        new ViewGroupException(
          'WorkspaceId is required',
          ViewGroupExceptionCode.INVALID_VIEW_GROUP_DATA,
          {
            userFriendlyMessage:
              'WorkspaceId is required to create a view group.',
          },
        ),
      );
    });

    it('should throw exception when viewId is missing', async () => {
      const invalidData = { ...validViewGroupData, viewId: undefined };

      await expect(viewGroupService.create(invalidData)).rejects.toThrow(
        new ViewGroupException(
          'ViewId is required',
          ViewGroupExceptionCode.INVALID_VIEW_GROUP_DATA,
          { userFriendlyMessage: 'ViewId is required to create a view group.' },
        ),
      );
    });

    it('should throw exception when fieldMetadataId is missing', async () => {
      const invalidData = { ...validViewGroupData, fieldMetadataId: undefined };

      await expect(viewGroupService.create(invalidData)).rejects.toThrow(
        new ViewGroupException(
          'FieldMetadataId is required',
          ViewGroupExceptionCode.INVALID_VIEW_GROUP_DATA,
          {
            userFriendlyMessage:
              'FieldMetadataId is required to create a view group.',
          },
        ),
      );
    });
  });

  describe('update', () => {
    it('should update a view group successfully', async () => {
      const id = 'view-group-id';
      const workspaceId = 'workspace-id';
      const updateData = { isVisible: false };
      const updatedViewGroup = { ...mockViewGroup, ...updateData };

      jest.spyOn(viewGroupService, 'findById').mockResolvedValue(mockViewGroup);
      jest
        .spyOn(viewGroupRepository, 'save')
        .mockResolvedValue(updatedViewGroup);

      const result = await viewGroupService.update(id, workspaceId, updateData);

      expect(viewGroupService.findById).toHaveBeenCalledWith(id, workspaceId);
      expect(viewGroupRepository.save).toHaveBeenCalledWith({
        id,
        ...updateData,
      });
      expect(result).toEqual({ ...mockViewGroup, ...updatedViewGroup });
    });

    it('should throw exception when view group is not found', async () => {
      const id = 'non-existent-id';
      const workspaceId = 'workspace-id';
      const updateData = { isVisible: false };

      jest.spyOn(viewGroupService, 'findById').mockResolvedValue(null);

      await expect(
        viewGroupService.update(id, workspaceId, updateData),
      ).rejects.toThrow(
        new ViewGroupException(
          `ViewGroup with id ${id} not found`,
          ViewGroupExceptionCode.VIEW_GROUP_NOT_FOUND,
        ),
      );
    });
  });

  describe('delete', () => {
    it('should delete a view group successfully', async () => {
      const id = 'view-group-id';
      const workspaceId = 'workspace-id';

      jest.spyOn(viewGroupService, 'findById').mockResolvedValue(mockViewGroup);
      jest
        .spyOn(viewGroupRepository, 'softDelete')
        .mockResolvedValue({} as any);

      const result = await viewGroupService.delete(id, workspaceId);

      expect(viewGroupService.findById).toHaveBeenCalledWith(id, workspaceId);
      expect(viewGroupRepository.softDelete).toHaveBeenCalledWith(id);
      expect(result).toEqual(mockViewGroup);
    });

    it('should throw exception when view group is not found', async () => {
      const id = 'non-existent-id';
      const workspaceId = 'workspace-id';

      jest.spyOn(viewGroupService, 'findById').mockResolvedValue(null);

      await expect(viewGroupService.delete(id, workspaceId)).rejects.toThrow(
        new ViewGroupException(
          `ViewGroup with id ${id} not found`,
          ViewGroupExceptionCode.VIEW_GROUP_NOT_FOUND,
        ),
      );
    });
  });
});
