import { isNonEmptyString } from '@sniptt/guards';
import { type RunAgentInput } from 'twenty-sdk/logic-function';

import { type TeamsAssistantTurn } from 'src/features/chat/logic-functions/types/teams-assistant-turn.type';

type TeamsAssistantAgentMessage = NonNullable<
  RunAgentInput['messages']
>[number];

const buildRecordReferenceSection = (
  workspaceBaseUrl: string | undefined,
): string => {
  if (!isNonEmptyString(workspaceBaseUrl)) {
    return 'This workspace URL could not be resolved, so record links are unavailable. Name records in plain text and never write a Twenty URL, not even a guessed one.';
  }

  return [
    `Every CRM record you name must be a Markdown link to its page in Twenty, written as [Record Name](${workspaceBaseUrl}/object/<objectNameSingular>/<recordId>).`,
    '- objectNameSingular is the singular API name of the object, such as person, company, opportunity, note or task',
    '- use the record id the tool returned; never guess or invent an id',
    '- link the record name itself, with no bare URLs and no "click here"',
    '- link a record the first time you name it; later repeats in the same reply can stay plain text',
  ].join('\n');
};

const buildPermissionSection = (workspaceMemberId: string): string =>
  [
    `You are acting as workspace member ${workspaceMemberId}, with that member's own permissions. When the request says me, my or mine, it means that member, and you can use their id directly.`,
    'Your tools are limited to what is permitted. A tool you need being absent means the action is not allowed, not that the object is missing, that the workspace is misconfigured or that the Teams connection is wrong. Say plainly what cannot be done and who to ask; never invite the requester to name the object, paste a record link or otherwise work around it.',
  ].join('\n\n');

export const buildTeamsAssistantMessages = ({
  requestText,
  history,
  workspaceMemberId,
  timeoutSeconds,
  workspaceBaseUrl,
}: {
  requestText: string;
  history: TeamsAssistantTurn[];
  workspaceMemberId: string;
  timeoutSeconds: number;
  workspaceBaseUrl: string | undefined;
}): TeamsAssistantAgentMessage[] => [
  ...history.flatMap((turn): TeamsAssistantAgentMessage[] => [
    { role: 'user', content: turn.requestText },
    { role: 'assistant', content: turn.responseText },
  ]),
  {
    role: 'user',
    content: [
      `This run is killed after ${timeoutSeconds} seconds and the member gets an error instead of an answer. Keep tool calls focused and reply as soon as you have enough to be useful.`,
      buildRecordReferenceSection(workspaceBaseUrl),
      buildPermissionSection(workspaceMemberId),
      `Request from Teams:\n${requestText}`,
    ].join('\n\n'),
  },
];
