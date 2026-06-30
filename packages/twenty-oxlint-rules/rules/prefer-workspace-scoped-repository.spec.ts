import { RuleTester } from 'oxlint/plugins-dev';

import { rule, RULE_NAME } from './prefer-workspace-scoped-repository';

const ruleTester = new RuleTester();

ruleTester.run(RULE_NAME, rule, {
  valid: [
    {
      // Entity not on the blacklist — raw @InjectRepository is fine.
      code: `
        class WorkspaceService {
          constructor(
            @InjectRepository(WorkspaceEntity)
            private readonly workspaceRepository: Repository<WorkspaceEntity>,
          ) {}
        }
      `,
      filename: 'workspace.service.ts',
    },
    {
      // Blacklisted entity injected through the scoped wrapper.
      code: `
        class AgentTurnGraderService {
          constructor(
            @InjectWorkspaceScopedRepository(AgentTurnEntity)
            private readonly turnRepository: WorkspaceScopedRepository<AgentTurnEntity>,
          ) {}
        }
      `,
      filename: 'agent-turn-grader.service.ts',
    },
    {
      // Non-constructor methods with decorators must be ignored.
      code: `
        class Service {
          @SomeDecorator()
          doStuff() {}
        }
      `,
      filename: 'something.service.ts',
    },
  ],
  invalid: [
    {
      code: `
        class AgentChatService {
          constructor(
            @InjectRepository(AgentChatThreadEntity)
            private readonly threadRepository: Repository<AgentChatThreadEntity>,
          ) {}
        }
      `,
      filename: 'agent-chat.service.ts',
      errors: [
        {
          messageId: 'preferWorkspaceScopedRepository',
          data: { entityName: 'AgentChatThreadEntity' },
        },
      ],
    },
    {
      // Multiple blacklisted entities → multiple errors.
      code: `
        class AgentChatService {
          constructor(
            @InjectRepository(AgentTurnEntity)
            private readonly turnRepository: Repository<AgentTurnEntity>,
            @InjectRepository(AgentMessageEntity)
            private readonly messageRepository: Repository<AgentMessageEntity>,
          ) {}
        }
      `,
      filename: 'agent-chat.service.ts',
      errors: [
        {
          messageId: 'preferWorkspaceScopedRepository',
          data: { entityName: 'AgentTurnEntity' },
        },
        {
          messageId: 'preferWorkspaceScopedRepository',
          data: { entityName: 'AgentMessageEntity' },
        },
      ],
    },
    {
      // Plain (non-parameter-property) constructor parameter with an
      // explicit assignment in the body. Must still be caught — the
      // rule should not depend on the TSParameterProperty shorthand.
      code: `
        class AgentChatService {
          private readonly threadRepository: Repository<AgentChatThreadEntity>;
          constructor(
            @InjectRepository(AgentChatThreadEntity)
            threadRepository: Repository<AgentChatThreadEntity>,
          ) {
            this.threadRepository = threadRepository;
          }
        }
      `,
      filename: 'agent-chat.service.ts',
      errors: [
        {
          messageId: 'preferWorkspaceScopedRepository',
          data: { entityName: 'AgentChatThreadEntity' },
        },
      ],
    },
  ],
});
