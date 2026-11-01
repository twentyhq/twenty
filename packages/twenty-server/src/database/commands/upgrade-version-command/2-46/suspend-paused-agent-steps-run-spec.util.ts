import { isNonEmptyString } from '@sniptt/guards';

// Frozen copy of the 2.46 workflow agent run spec, so later runtime changes do not
// change what the command writes for steps paused before 2.46
const WORKFLOW_BASE_SYSTEM_PROMPT = `You are executing as part of a workflow automation in Twenty CRM.

Tool usage strategy:
- Chain multiple tools to solve complex tasks
- Prefer batch tools (\`create_many_*\`, \`update_many_*\`, \`upsert_many_*\`, etc.) over looping single-item calls
- Use \`upsert_many_*\` instead of \`update_many_*\` when records have different data to set individually, or when some records may not exist yet
- If a tool fails, try alternative approaches
- Use results from one tool to inform the next
- Don't give up after first failure - be persistent

Context:
- Your output may be used by downstream workflow nodes
- Be thorough and include all relevant data
- Focus on completing the task efficiently

Permissions:
- Only perform actions your role allows`;

const WORKFLOW_AGENT_HUMAN_INPUT_PROMPT = `You run inside a workflow, with nobody watching as you work. You can stop and ask the person who owns the workflow for input: the workflow pauses until they answer in their inbox, then you continue with their answer. Call ask_question for a decision or a fact only a person can give, request_form for typed values such as a date, an amount or a record to pick, and propose_tool_call with the tool and arguments you would have used for an action they must approve first: they approve it, possibly with edits, or reject it with feedback, and you get the result. An email they must review is proposed as a send_email call they can edit, send, save as a draft or discard. Ask everything you need at once, with one ask_question call per question, and never ask about what you can find or decide yourself. Stop for input only as the workflow's instructions below say:`;

const APPLICATION_BOUND_AGENT_EXCLUDED_TOOL_NAMES = [
  'code_interpreter',
  'save_campaign',
  'send_email',
  'draft_email',
  'find_connected_accounts',
  'create_calendar_event',
];

export type PausedAgentStepDefinition = {
  name: string;
  settings: {
    input: {
      agentId?: string;
      humanInputInstructions?: string;
    };
  };
};

export const buildPausedAgentStepRunSpec = ({
  step,
  isApplicationBound,
}: {
  step: PausedAgentStepDefinition;
  isApplicationBound: boolean;
}) => {
  const { agentId, humanInputInstructions } = step.settings.input;
  const trimmedHumanInputInstructions = humanInputInstructions?.trim();
  const canAskHumans = isNonEmptyString(trimmedHumanInputInstructions);

  return {
    agentId: isNonEmptyString(agentId) ? agentId : null,
    title: step.name,
    baseSystemPrompt: WORKFLOW_BASE_SYSTEM_PROMPT,
    instructions: canAskHumans
      ? `${WORKFLOW_AGENT_HUMAN_INPUT_PROMPT}\n\n${trimmedHumanInputInstructions}`
      : null,
    capabilities: {
      canAskHumans,
    },
    ...(isApplicationBound
      ? {
          additionalExcludedToolNames: [
            ...APPLICATION_BOUND_AGENT_EXCLUDED_TOOL_NAMES,
          ],
        }
      : {}),
  };
};
