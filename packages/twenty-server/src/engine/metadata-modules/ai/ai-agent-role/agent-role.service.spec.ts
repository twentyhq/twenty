import { Test, type TestingModule } from '@nestjs/testing';

import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';
import { AgentEntity } from 'src/engine/metadata-modules/ai/ai-agent/entities/agent.entity';
import { type ModelId } from 'src/engine/metadata-modules/ai/ai-models/types/model-id.type';
import { type FlatRoleTarget } from 'src/engine/metadata-modules/flat-role-target/types/flat-role-target.type';
import { RoleTargetEntity } from 'src/engine/metadata-modules/role-target/role-target.entity';
import { RoleTargetService } from 'src/engine/metadata-modules/role-target/services/role-target.service';
import { RoleEntity } from 'src/engine/metadata-modules/role/role.entity';
import { getWorkspaceScopedRepositoryToken } from 'src/engine/twenty-orm/workspace-scoped-repository/get-workspace-scoped-repository-token.util';
import { type WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
import { AiAgentRoleService } from './ai-agent-role.service';

describe('AiAgentRoleService', () => {
  let service: AiAgentRoleService;
  let agentRepository: WorkspaceScopedRepository<AgentEntity>;
  let roleRepository: WorkspaceScopedRepository<RoleEntity>;
  let roleTargetRepository: WorkspaceScopedRepository<RoleTargetEntity>;
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
          provide: getWorkspaceScopedRepositoryToken(AgentEntity),
          useValue: {
            findOne: jest.fn(),
            find: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: getWorkspaceScopedRepositoryToken(RoleEntity),
          useValue: {
            findOne: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: getWorkspaceScopedRepositoryToken(RoleTargetEntity),
          useValue: {
            findOne: jest.fn(),
            save: jest.fn(),
            delete: jest.fn(),
            find: jest.fn(),
            count: jest.fn(),
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
    agentRepository = module.get<WorkspaceScopedRepository<AgentEntity>>(
      getWorkspaceScopedRepositoryToken(AgentEntity),
    );
    roleRepository = module.get<WorkspaceScopedRepository<RoleEntity>>(
      getWorkspaceScopedRepositoryToken(RoleEntity),
    );
    roleTargetRepository = module.get<
      WorkspaceScopedRepository<RoleTargetEntity>
    >(getWorkspaceScopedRepositoryToken(RoleTargetEntity));
    roleTargetService = module.get<RoleTargetService>(RoleTargetService);

    // Setup test data
    testAgent = {
      id: 'test-agent-id',
      name: 'Test Agent',
      description: 'Test agent for unit tests',
      prompt: 'You are a test agent',
      modelId: 'openai/gpt-4o' as ModelId,
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
      expect(agentRepository.findOne).toHaveBeenCalledWith(testWorkspaceId, {
        where: { id: testAgent.id },
      });
      expect(roleRepository.findOne).toHaveBeenCalledWith(testWorkspaceId, {
        where: { id: testRole.id },
      });
      expect(roleTargetRepository.findOne).toHaveBeenCalledWith(
        testWorkspaceId,
        {
          where: {
            agentId: testAgent.id,
            roleId: testRole.id,
          },
        },
      );
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

    it('should throw AiException when agent does not exist', async () => {
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
      ).rejects.toThrow(AiException);

      await expect(
        service.assignRoleToAgent({
          workspaceId: testWorkspaceId,
          agentId: nonExistentAgentId,
          roleId: testRole.id,
        }),
      ).rejects.toMatchObject({
        code: AiExceptionCode.AGENT_NOT_FOUND,
        message: `Agent with id ${nonExistentAgentId} not found in workspace`,
      });
    });

    it('should throw AiException when role does not exist', async () => {
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
      ).rejects.toThrow(AiException);

      await expect(
        service.assignRoleToAgent({
          workspaceId: testWorkspaceId,
          agentId: testAgent.id,
          roleId: nonExistentRoleId,
        }),
      ).rejects.toMatchObject({
        code: AiExceptionCode.ROLE_NOT_FOUND,
        message: `Role with id ${nonExistentRoleId} not found in workspace`,
      });
    });

    it('should throw AiException when agent belongs to different workspace', async () => {
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
      ).rejects.toThrow(AiException);

      await expect(
        service.assignRoleToAgent({
          workspaceId: differentWorkspaceId,
          agentId: testAgent.id,
          roleId: testRole.id,
        }),
      ).rejects.toMatchObject({
        code: AiExceptionCode.AGENT_NOT_FOUND,
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
      expect(roleTargetRepository.findOne).toHaveBeenCalledWith(
        testWorkspaceId,
        {
          where: {
            agentId: testAgent.id,
          },
        },
      );
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
      ).rejects.toThrow(AiException);

      await expect(
        service.removeRoleFromAgent({
          workspaceId: testWorkspaceId,
          agentId: testAgent.id,
        }),
      ).rejects.toMatchObject({
        code: AiExceptionCode.ROLE_NOT_FOUND,
        message: `Role target not found for agent ${testAgent.id}`,
      });
    });
  });
});
