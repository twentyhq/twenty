import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { type Repository } from 'typeorm';

import {
  AgentException,
  AgentExceptionCode,
} from 'src/engine/metadata-modules/ai/ai-agent/agent.exception';
import { AgentEntity } from 'src/engine/metadata-modules/ai/ai-agent/entities/agent.entity';
import { type ModelId } from 'src/engine/metadata-modules/ai/ai-models/constants/ai-models.const';
import { type FlatRoleTarget } from 'src/engine/metadata-modules/flat-role-target/types/flat-role-target.type';
import { RoleTargetEntity } from 'src/engine/metadata-modules/role-target/role-target.entity';
import { RoleTargetService } from 'src/engine/metadata-modules/role-target/services/role-target.service';
import { RoleEntity } from 'src/engine/metadata-modules/role/role.entity';

import { AiAgentRoleService } from './ai-agent-role.service';

describe('AiAgentRoleService', () => {
  let service: AiAgentRoleService;
  let agentRepository: Repository<AgentEntity>;
  let roleRepository: Repository<RoleEntity>;
  let roleTargetRepository: Repository<RoleTargetEntity>;
  let roleTargetService: RoleTargetService;

  const testWorkspaceId = 'test-workspace-id';
  let testAgent: AgentEntity;
  let testRole: RoleEntity;
  let testRole2: RoleEntity;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AiAgentRoleService,
        {
          provide: getRepositoryToken(AgentEntity),
          useValue: {
            findOne: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(RoleEntity),
          useValue: {
            findOne: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(RoleTargetEntity),
          useValue: {
            findOne: jest.fn(),
            save: jest.fn(),
            delete: jest.fn(),
            find: jest.fn(),
          },
        },
        {
          provide: RoleTargetService,
          useValue: {
            create: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AiAgentRoleService>(AiAgentRoleService);
    agentRepository = module.get<Repository<AgentEntity>>(
      getRepositoryToken(AgentEntity),
    );
    roleRepository = module.get<Repository<RoleEntity>>(
      getRepositoryToken(RoleEntity),
    );
    roleTargetRepository = module.get<Repository<RoleTargetEntity>>(
      getRepositoryToken(RoleTargetEntity),
    );
    roleTargetService = module.get<RoleTargetService>(RoleTargetService);

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
      canBeAssignedToAgents: true,
      canBeAssignedToUsers: true,
      canBeAssignedToApiKeys: true,
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
      canBeAssignedToAgents: true,
      canBeAssignedToUsers: true,
      canBeAssignedToApiKeys: true,
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
      jest.spyOn(agentRepository, 'findOne').mockResolvedValue(testAgent);
      jest.spyOn(roleRepository, 'findOne').mockResolvedValue(testRole);
      jest.spyOn(roleTargetRepository, 'findOne').mockResolvedValue(null);
      jest
        .spyOn(roleTargetService, 'create')
        .mockResolvedValue({} as FlatRoleTarget);

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
      expect(roleTargetRepository.findOne).toHaveBeenCalledWith({
        where: {
          agentId: testAgent.id,
          roleId: testRole.id,
          workspaceId: testWorkspaceId,
        },
      });
      expect(roleTargetService.create).toHaveBeenCalledWith({
        createRoleTargetInput: {
          roleId: testRole.id,
          targetId: testAgent.id,
          targetMetadataForeignKey: 'agentId',
        },
        workspaceId: testWorkspaceId,
      });
    });

    it('should replace existing role when assigning a new role to an agent', async () => {
      // Arrange
      jest.spyOn(agentRepository, 'findOne').mockResolvedValue(testAgent);
      jest.spyOn(roleRepository, 'findOne').mockResolvedValue(testRole2);
      jest.spyOn(roleTargetRepository, 'findOne').mockResolvedValue(null);
      jest
        .spyOn(roleTargetService, 'create')
        .mockResolvedValue({} as FlatRoleTarget);

      // Act
      await service.assignRoleToAgent({
        workspaceId: testWorkspaceId,
        agentId: testAgent.id,
        roleId: testRole2.id,
      });

      // Assert
      expect(roleTargetService.create).toHaveBeenCalledWith({
        createRoleTargetInput: {
          roleId: testRole2.id,
          targetId: testAgent.id,
          targetMetadataForeignKey: 'agentId',
        },
        workspaceId: testWorkspaceId,
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
      } as RoleTargetEntity;

      jest.spyOn(agentRepository, 'findOne').mockResolvedValue(testAgent);
      jest.spyOn(roleRepository, 'findOne').mockResolvedValue(testRole);
      jest
        .spyOn(roleTargetRepository, 'findOne')
        .mockResolvedValue(existingRoleTarget);

      // Act
      await service.assignRoleToAgent({
        workspaceId: testWorkspaceId,
        agentId: testAgent.id,
        roleId: testRole.id,
      });

      // Assert
      expect(roleTargetService.create).not.toHaveBeenCalled();
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
        code: AgentExceptionCode.ROLE_NOT_FOUND,
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
      const existingRoleTarget = {
        id: 'existing-role-target-id',
        roleId: testRole.id,
        agentId: testAgent.id,
        workspaceId: testWorkspaceId,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as RoleTargetEntity;

      jest
        .spyOn(roleTargetRepository, 'findOne')
        .mockResolvedValue(existingRoleTarget);
      jest.spyOn(roleTargetService, 'delete').mockResolvedValue(undefined);

      // Act
      await service.removeRoleFromAgent({
        workspaceId: testWorkspaceId,
        agentId: testAgent.id,
      });

      // Assert
      expect(roleTargetRepository.findOne).toHaveBeenCalledWith({
        where: {
          agentId: testAgent.id,
          workspaceId: testWorkspaceId,
        },
      });
      expect(roleTargetService.delete).toHaveBeenCalledWith({
        id: existingRoleTarget.id,
        workspaceId: testWorkspaceId,
      });
    });

    it('should throw error when removing role from agent that has no role', async () => {
      // Arrange
      jest.spyOn(roleTargetRepository, 'findOne').mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.removeRoleFromAgent({
          workspaceId: testWorkspaceId,
          agentId: testAgent.id,
        }),
      ).rejects.toThrow(AgentException);

      await expect(
        service.removeRoleFromAgent({
          workspaceId: testWorkspaceId,
          agentId: testAgent.id,
        }),
      ).rejects.toMatchObject({
        code: AgentExceptionCode.ROLE_NOT_FOUND,
        message: `Role target not found for agent ${testAgent.id}`,
      });
    });
  });
});
