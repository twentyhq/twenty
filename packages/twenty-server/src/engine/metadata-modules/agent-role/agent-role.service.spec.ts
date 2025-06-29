import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { ModelId } from 'src/engine/core-modules/ai/constants/ai-models.const';
import { AgentEntity } from 'src/engine/metadata-modules/agent/agent.entity';
import {
  AgentException,
  AgentExceptionCode,
} from 'src/engine/metadata-modules/agent/agent.exception';
import { RoleTargetsEntity } from 'src/engine/metadata-modules/role/role-targets.entity';
import { RoleEntity } from 'src/engine/metadata-modules/role/role.entity';

import { AgentRoleService } from './agent-role.service';

describe('AgentRoleService', () => {
  let service: AgentRoleService;
  let agentRepository: Repository<AgentEntity>;
  let roleRepository: Repository<RoleEntity>;
  let roleTargetsRepository: Repository<RoleTargetsEntity>;

  const testWorkspaceId = 'test-workspace-id';
  let testAgent: AgentEntity;
  let testRole: RoleEntity;
  let testRole2: RoleEntity;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AgentRoleService,
        {
          provide: getRepositoryToken(AgentEntity, 'core'),
          useValue: {
            findOne: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(RoleEntity, 'core'),
          useValue: {
            findOne: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(RoleTargetsEntity, 'core'),
          useValue: {
            findOne: jest.fn(),
            save: jest.fn(),
            delete: jest.fn(),
            find: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AgentRoleService>(AgentRoleService);
    agentRepository = module.get<Repository<AgentEntity>>(
      getRepositoryToken(AgentEntity, 'core'),
    );
    roleRepository = module.get<Repository<RoleEntity>>(
      getRepositoryToken(RoleEntity, 'core'),
    );
    roleTargetsRepository = module.get<Repository<RoleTargetsEntity>>(
      getRepositoryToken(RoleTargetsEntity, 'core'),
    );

    // Setup test data
    testAgent = {
      id: 'test-agent-id',
      name: 'Test Agent',
      description: 'Test agent for unit tests',
      prompt: 'You are a test agent',
      modelId: 'gpt-4o' as ModelId,
      workspaceId: testWorkspaceId,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as AgentEntity;

    testRole = {
      id: 'test-role-id',
      label: 'Test Role',
      description: 'Test role for unit tests',
      canUpdateAllSettings: false,
      canReadAllObjectRecords: true,
      canUpdateAllObjectRecords: false,
      canSoftDeleteAllObjectRecords: false,
      canDestroyAllObjectRecords: false,
      workspaceId: testWorkspaceId,
      createdAt: new Date(),
      updatedAt: new Date(),
      isEditable: true,
    } as RoleEntity;

    testRole2 = {
      id: 'test-role-2-id',
      label: 'Test Role 2',
      description: 'Second test role for unit tests',
      canUpdateAllSettings: true,
      canReadAllObjectRecords: true,
      canUpdateAllObjectRecords: true,
      canSoftDeleteAllObjectRecords: false,
      canDestroyAllObjectRecords: false,
      workspaceId: testWorkspaceId,
      createdAt: new Date(),
      updatedAt: new Date(),
      isEditable: true,
    } as RoleEntity;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('assignRoleToAgent', () => {
    it('should successfully assign a role to an agent', async () => {
      // Arrange
      const newRoleTarget = {
        id: 'new-role-target-id',
        roleId: testRole.id,
        agentId: testAgent.id,
        workspaceId: testWorkspaceId,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as RoleTargetsEntity;

      jest.spyOn(agentRepository, 'findOne').mockResolvedValue(testAgent);
      jest.spyOn(roleRepository, 'findOne').mockResolvedValue(testRole);
      jest.spyOn(roleTargetsRepository, 'findOne').mockResolvedValue(null);
      jest
        .spyOn(roleTargetsRepository, 'save')
        .mockResolvedValue(newRoleTarget);
      jest
        .spyOn(roleTargetsRepository, 'delete')
        .mockResolvedValue({ affected: 0 } as any);

      // Act
      await service.assignRoleToAgent({
        workspaceId: testWorkspaceId,
        agentId: testAgent.id,
        roleId: testRole.id,
      });

      // Assert
      expect(agentRepository.findOne).toHaveBeenCalledWith({
        where: { id: testAgent.id, workspaceId: testWorkspaceId },
      });
      expect(roleRepository.findOne).toHaveBeenCalledWith({
        where: { id: testRole.id, workspaceId: testWorkspaceId },
      });
      expect(roleTargetsRepository.findOne).toHaveBeenCalledWith({
        where: {
          agentId: testAgent.id,
          roleId: testRole.id,
          workspaceId: testWorkspaceId,
        },
      });
      expect(roleTargetsRepository.save).toHaveBeenCalledWith({
        roleId: testRole.id,
        agentId: testAgent.id,
        workspaceId: testWorkspaceId,
      });
      expect(roleTargetsRepository.delete).toHaveBeenCalledWith({
        agentId: testAgent.id,
        workspaceId: testWorkspaceId,
        id: expect.any(Object), // Not(newRoleTarget.id)
      });
    });

    it('should replace existing role when assigning a new role to an agent', async () => {
      // Arrange
      const newRoleTarget = {
        id: 'new-role-target-id',
        roleId: testRole2.id,
        agentId: testAgent.id,
        workspaceId: testWorkspaceId,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as RoleTargetsEntity;

      jest.spyOn(agentRepository, 'findOne').mockResolvedValue(testAgent);
      jest.spyOn(roleRepository, 'findOne').mockResolvedValue(testRole2);
      jest.spyOn(roleTargetsRepository, 'findOne').mockResolvedValue(null);
      jest
        .spyOn(roleTargetsRepository, 'save')
        .mockResolvedValue(newRoleTarget);
      jest
        .spyOn(roleTargetsRepository, 'delete')
        .mockResolvedValue({ affected: 1 } as any);

      // Act
      await service.assignRoleToAgent({
        workspaceId: testWorkspaceId,
        agentId: testAgent.id,
        roleId: testRole2.id,
      });

      // Assert
      expect(roleTargetsRepository.save).toHaveBeenCalledWith({
        roleId: testRole2.id,
        agentId: testAgent.id,
        workspaceId: testWorkspaceId,
      });
      expect(roleTargetsRepository.delete).toHaveBeenCalledWith({
        agentId: testAgent.id,
        workspaceId: testWorkspaceId,
        id: expect.any(Object), // Not(newRoleTarget.id)
      });
    });

    it('should not create duplicate role target when assigning the same role', async () => {
      // Arrange
      const existingRoleTarget = {
        id: 'existing-role-target-id',
        roleId: testRole.id,
        agentId: testAgent.id,
        workspaceId: testWorkspaceId,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as RoleTargetsEntity;

      jest.spyOn(agentRepository, 'findOne').mockResolvedValue(testAgent);
      jest.spyOn(roleRepository, 'findOne').mockResolvedValue(testRole);
      jest
        .spyOn(roleTargetsRepository, 'findOne')
        .mockResolvedValue(existingRoleTarget);

      // Act
      await service.assignRoleToAgent({
        workspaceId: testWorkspaceId,
        agentId: testAgent.id,
        roleId: testRole.id,
      });

      // Assert
      expect(roleTargetsRepository.save).not.toHaveBeenCalled();
      expect(roleTargetsRepository.delete).not.toHaveBeenCalled();
    });

    it('should throw AgentException when agent does not exist', async () => {
      // Arrange
      const nonExistentAgentId = 'non-existent-agent-id';

      jest.spyOn(agentRepository, 'findOne').mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.assignRoleToAgent({
          workspaceId: testWorkspaceId,
          agentId: nonExistentAgentId,
          roleId: testRole.id,
        }),
      ).rejects.toThrow(AgentException);

      await expect(
        service.assignRoleToAgent({
          workspaceId: testWorkspaceId,
          agentId: nonExistentAgentId,
          roleId: testRole.id,
        }),
      ).rejects.toMatchObject({
        code: AgentExceptionCode.AGENT_NOT_FOUND,
        message: `Agent with id ${nonExistentAgentId} not found in workspace`,
      });
    });

    it('should throw AgentException when role does not exist', async () => {
      // Arrange
      const nonExistentRoleId = 'non-existent-role-id';

      jest.spyOn(agentRepository, 'findOne').mockResolvedValue(testAgent);
      jest.spyOn(roleRepository, 'findOne').mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.assignRoleToAgent({
          workspaceId: testWorkspaceId,
          agentId: testAgent.id,
          roleId: nonExistentRoleId,
        }),
      ).rejects.toThrow(AgentException);

      await expect(
        service.assignRoleToAgent({
          workspaceId: testWorkspaceId,
          agentId: testAgent.id,
          roleId: nonExistentRoleId,
        }),
      ).rejects.toMatchObject({
        code: AgentExceptionCode.AGENT_EXECUTION_FAILED,
        message: `Role with id ${nonExistentRoleId} not found in workspace`,
      });
    });

    it('should throw AgentException when agent belongs to different workspace', async () => {
      // Arrange
      const differentWorkspaceId = 'different-workspace-id';

      jest.spyOn(agentRepository, 'findOne').mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.assignRoleToAgent({
          workspaceId: differentWorkspaceId,
          agentId: testAgent.id,
          roleId: testRole.id,
        }),
      ).rejects.toThrow(AgentException);

      await expect(
        service.assignRoleToAgent({
          workspaceId: differentWorkspaceId,
          agentId: testAgent.id,
          roleId: testRole.id,
        }),
      ).rejects.toMatchObject({
        code: AgentExceptionCode.AGENT_NOT_FOUND,
        message: `Agent with id ${testAgent.id} not found in workspace`,
      });
    });
  });

  describe('removeRoleFromAgent', () => {
    it('should successfully remove role from agent', async () => {
      // Arrange
      jest
        .spyOn(roleTargetsRepository, 'delete')
        .mockResolvedValue({ affected: 1 } as any);

      // Act
      await service.removeRoleFromAgent({
        workspaceId: testWorkspaceId,
        agentId: testAgent.id,
      });

      // Assert
      expect(roleTargetsRepository.delete).toHaveBeenCalledWith({
        agentId: testAgent.id,
        workspaceId: testWorkspaceId,
      });
    });

    it('should not throw error when removing role from agent that has no role', async () => {
      // Arrange
      jest
        .spyOn(roleTargetsRepository, 'delete')
        .mockResolvedValue({ affected: 0 } as any);

      // Act & Assert - Should not throw
      await expect(
        service.removeRoleFromAgent({
          workspaceId: testWorkspaceId,
          agentId: testAgent.id,
        }),
      ).resolves.not.toThrow();

      expect(roleTargetsRepository.delete).toHaveBeenCalledWith({
        agentId: testAgent.id,
        workspaceId: testWorkspaceId,
      });
    });
  });
});
