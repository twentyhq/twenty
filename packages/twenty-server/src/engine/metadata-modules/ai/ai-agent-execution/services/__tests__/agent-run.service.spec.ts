import { Test, type TestingModule } from '@nestjs/testing';

import { getRepositoryToken } from '@nestjs/typeorm';

import { In } from 'typeorm';
import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';

import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { type FlatWorkspace } from 'src/engine/core-modules/workspace/types/flat-workspace.type';
import { AgentAsyncExecutorService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-async-executor.service';
import { AgentRunService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-run.service';
import { AgentEntity } from 'src/engine/metadata-modules/ai/ai-agent/entities/agent.entity';
import { getWorkspaceScopedRepositoryToken } from 'src/engine/twenty-orm/workspace-scoped-repository/get-workspace-scoped-repository-token.util';

describe('AgentRunService', () => {
  let service: AgentRunService;
  let agentRepository: { findOne: jest.Mock };
  let applicationRepository: { findOne: jest.Mock };
  let agentAsyncExecutorService: { executeAgent: jest.Mock };

  const workspace = { id: 'workspace-1' } as FlatWorkspace;
  const application = { id: 'app-1' } as FlatApplication;
  const standardApplicationId = 'standard-app-1';

  const input = {
    agentUniversalIdentifier: 'agent-uid',
    prompt: 'Enrich record 123',
  };

  beforeEach(async () => {
    agentRepository = { findOne: jest.fn() };
    applicationRepository = { findOne: jest.fn() };
    agentAsyncExecutorService = {
      executeAgent: jest.fn().mockResolvedValue({
        result: { response: 'done' },
        hasNoMoreAvailableCredits: false,
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AgentRunService,
        {
          provide: AgentAsyncExecutorService,
          useValue: agentAsyncExecutorService,
        },
        {
          provide: getWorkspaceScopedRepositoryToken(AgentEntity),
          useValue: agentRepository,
        },
        {
          provide: getRepositoryToken(ApplicationEntity),
          useValue: applicationRepository,
        },
      ],
    }).compile();

    service = module.get(AgentRunService);
  });

  it('runs an agent belonging to the calling app or the standard app', async () => {
    applicationRepository.findOne.mockResolvedValue({
      id: standardApplicationId,
    });
    agentRepository.findOne.mockResolvedValue({ id: 'agent-1' } as AgentEntity);

    const result = await service.run({
      workspace,
      application,
      requestUserWorkspaceId: 'user-workspace-1',
      input,
    });

    expect(applicationRepository.findOne).toHaveBeenCalledWith({
      where: {
        universalIdentifier: TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
        workspaceId: workspace.id,
      },
    });
    expect(agentRepository.findOne).toHaveBeenCalledWith(workspace.id, {
      where: {
        universalIdentifier: input.agentUniversalIdentifier,
        applicationId: In([application.id, standardApplicationId]),
      },
    });
    expect(result).toEqual({
      result: { response: 'done' },
      hasNoMoreAvailableCredits: false,
    });
  });

  it('scopes the lookup to the calling app when the standard app is missing', async () => {
    applicationRepository.findOne.mockResolvedValue(null);
    agentRepository.findOne.mockResolvedValue({ id: 'agent-1' } as AgentEntity);

    await service.run({
      workspace,
      application,
      requestUserWorkspaceId: null,
      input,
    });

    expect(agentRepository.findOne).toHaveBeenCalledWith(workspace.id, {
      where: {
        universalIdentifier: input.agentUniversalIdentifier,
        applicationId: In([application.id]),
      },
    });
  });

  it('throws when no runnable agent matches the identifier', async () => {
    applicationRepository.findOne.mockResolvedValue({
      id: standardApplicationId,
    });
    agentRepository.findOne.mockResolvedValue(null);

    await expect(
      service.run({
        workspace,
        application,
        requestUserWorkspaceId: null,
        input,
      }),
    ).rejects.toThrow(/not found for this application/);

    expect(agentAsyncExecutorService.executeAgent).not.toHaveBeenCalled();
  });
});
