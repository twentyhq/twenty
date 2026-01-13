import { Injectable, Logger } from '@nestjs/common';

type ChatMessageRole = 'user' | 'assistant' | 'system';

type AgentType =
  | 'orchestrator'
  | 'workflow'
  | 'data'
  | 'context'
  | 'content';

interface ChatMessage {
  role: ChatMessageRole;
  content: string;
}

interface ToolCall {
  id: string;
  name: string;
  arguments: Record<string, unknown>;
  result?: unknown;
}

interface ChatResponse {
  content: string;
  agent?: AgentType;
  toolCalls?: ToolCall[];
}

interface ChatContext {
  messages: ChatMessage[];
  activeAgent: AgentType;
  linkedEntity?: { type: string; id: string; name: string };
  workspaceId: string;
  userId: string;
}

@Injectable()
export class AIChatService {
  private readonly logger = new Logger(AIChatService.name);
  private readonly ctxMcpUrl: string;
  private readonly kbMcpUrl: string;
  private readonly n8nApiUrl: string;

  constructor() {
    this.ctxMcpUrl = process.env.CTX_MCP_URL ?? 'http://ctx-mcp:3100';
    this.kbMcpUrl = process.env.KB_MCP_URL ?? 'http://kb-mcp:3110';
    this.n8nApiUrl = process.env.N8N_API_URL ?? 'http://n8n:5678';
  }

  async sendMessage(
    content: string,
    context: ChatContext,
  ): Promise<ChatResponse> {
    this.logger.log(`Processing message for agent: ${context.activeAgent}`);

    try {
      switch (context.activeAgent) {
        case 'workflow':
          return this.handleWorkflowAgent(content, context);
        case 'data':
          return this.handleDataAgent(content, context);
        case 'context':
          return this.handleContextAgent(content, context);
        case 'content':
          return this.handleContentAgent(content, context);
        default:
          return this.handleOrchestrator(content, context);
      }
    } catch (error) {
      this.logger.error(
        `Error processing message: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw error;
    }
  }

  private handleOrchestrator(
    content: string,
    _context: ChatContext,
  ): ChatResponse {
    const lowerContent = content.toLowerCase();

    if (
      lowerContent.includes('workflow') ||
      lowerContent.includes('automate') ||
      lowerContent.includes('n8n')
    ) {
      return {
        content:
          'I can help you create workflows. What kind of automation do you need?',
        agent: 'workflow',
      };
    }

    if (
      lowerContent.includes('create') ||
      lowerContent.includes('update') ||
      lowerContent.includes('contact') ||
      lowerContent.includes('company')
    ) {
      return {
        content:
          'I can help you manage CRM data. What would you like to do?',
        agent: 'data',
      };
    }

    if (
      lowerContent.includes('who') ||
      lowerContent.includes('what') ||
      lowerContent.includes('about')
    ) {
      return {
        content:
          'I can provide context about people and companies. What would you like to know?',
        agent: 'context',
      };
    }

    if (
      lowerContent.includes('write') ||
      lowerContent.includes('email') ||
      lowerContent.includes('draft')
    ) {
      return {
        content:
          'I can help you write content. What would you like me to compose?',
        agent: 'content',
      };
    }

    return {
      content: `I'm your AI assistant. I can help you with:
- **Workflows**: Create and manage n8n automations
- **Data**: Create, update, search CRM records
- **Context**: Get information about people and companies
- **Content**: Write emails and newsletters

What would you like to do?`,
      agent: 'orchestrator',
    };
  }

  private handleWorkflowAgent(
    _content: string,
    _context: ChatContext,
  ): ChatResponse {
    return {
      content: `I understand you want to work with workflows.
Let me help you create an automation.

What should trigger this workflow?`,
      agent: 'workflow',
    };
  }

  private handleDataAgent(
    _content: string,
    _context: ChatContext,
  ): ChatResponse {
    return {
      content: `I can help you manage CRM data.
What record would you like to create or update?`,
      agent: 'data',
    };
  }

  private async handleContextAgent(
    _content: string,
    context: ChatContext,
  ): Promise<ChatResponse> {
    try {
      const response = await fetch(`${this.ctxMcpUrl}/mcp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'tools/call',
          params: {
            name: 'ctx_get_context',
            arguments: {
              workspace_id: context.workspaceId,
              profile_id: context.userId,
            },
          },
          id: Date.now(),
        }),
      });

      if (response.ok) {
        const data = (await response.json()) as { result?: unknown };

        return {
          content: `Based on the context I found:\n${JSON.stringify(data.result, null, 2)}`,
          agent: 'context',
          toolCalls: [
            {
              id: 'ctx_1',
              name: 'ctx_get_context',
              arguments: { workspace_id: context.workspaceId },
              result: data.result,
            },
          ],
        };
      }
    } catch (error) {
      this.logger.warn(
        `Failed to fetch context: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }

    return {
      content:
        'I can provide information about your workspace context. What would you like to know?',
      agent: 'context',
    };
  }

  private handleContentAgent(
    _content: string,
    _context: ChatContext,
  ): ChatResponse {
    return {
      content: `I can help you write content.
What type of content do you need?
- Email to a contact
- Newsletter for subscribers
- Follow-up message`,
      agent: 'content',
    };
  }
}
