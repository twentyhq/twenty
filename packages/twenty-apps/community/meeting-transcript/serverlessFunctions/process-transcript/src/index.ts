import axios from 'axios';
import OpenAI from 'openai';
import { type ServerlessFunctionConfig } from 'twenty-sdk/application';

type TranscriptWebhookPayload = {
  transcript: string;
  relatedPersonId: string;
  meetingTitle?: string;
  meetingDate?: string;
  participants?: string[];
  metadata?: Record<string, unknown>;
  token?: string;
};

type ActionItem = {
  title: string;
  description: string;
  assignee?: string;
  dueDate?: string;
};

type Commitment = {
  person: string;
  commitment: string;
  dueDate?: string;
};

type AnalysisResult = {
  summary: string;
  keyPoints: string[];
  actionItems: ActionItem[];
  commitments: Commitment[];
};

type RichTextV2Data = {
  markdown: string;
  blocknote: null;
};

type TwentyApiResponse = {
  id: string;
};

const AI_PROVIDER_API_KEY = process.env.AI_PROVIDER_API_KEY;
const WEBHOOK_SECRET_TOKEN = process.env.WEBHOOK_SECRET_TOKEN;
const TWENTY_API_URL = process.env.TWENTY_API_URL;
const AI_PROVIDER_API_BASE_URL = process.env.AI_PROVIDER_API_BASE_URL;

const LLM_MODEL_ID = 'openai/gpt-oss-20b';
const OPENAI_TEMPERATURE = 0.3;

const openai = new OpenAI({
  apiKey: AI_PROVIDER_API_KEY,
  baseURL: AI_PROVIDER_API_BASE_URL,
});

const getTwentyApiConfig = () => {
  const apiKey = process.env.TWENTY_API_KEY;
  if (!apiKey) {
    throw new Error('TWENTY_API_KEY environment variable is not set');
  }

  const baseUrl = TWENTY_API_URL;
  if (!baseUrl) {
    throw new Error('TWENTY_API_URL environment variable is not set');
  }

  return { apiKey, baseUrl };
};

const lookupWorkspaceMemberByName = async (
  name: string,
): Promise<string | null> => {
  const { apiKey, baseUrl } = getTwentyApiConfig();

  try {
    const graphqlQuery = {
      query: `
        query GetAllWorkspaceMembers {
          workspaceMembers {
            edges {
              node {
                id
                name {
                  firstName
                  lastName
                }
              }
            }
          }
        }
      `,
    };

    const response = await axios.post(`${baseUrl}/graphql`, graphqlQuery, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
    });

    const edges = response.data?.data?.workspaceMembers?.edges;

    if (!edges || edges.length === 0) {
      console.log('⚠️ No workspace members found');
      return null;
    }

    const searchName = name.trim().toLowerCase();

    for (const edge of edges) {
      const firstName = edge.node.name?.firstName || '';
      const lastName = edge.node.name?.lastName || '';
      const fullName = `${firstName} ${lastName}`.trim().toLowerCase();

      if (fullName === searchName) {
        console.log(
          `✅ Found workspace member (exact): ${firstName} ${lastName} (ID: ${edge.node.id})`,
        );
        return edge.node.id;
      }
    }

    for (const edge of edges) {
      const firstName = edge.node.name?.firstName || '';
      if (firstName.toLowerCase() === searchName) {
        const lastName = edge.node.name?.lastName || '';
        console.log(
          `✅ Found workspace member (first name): ${firstName} ${lastName} (ID: ${edge.node.id})`,
        );
        return edge.node.id;
      }
    }

    for (const edge of edges) {
      const lastName = edge.node.name?.lastName || '';
      if (lastName.toLowerCase() === searchName) {
        const firstName = edge.node.name?.firstName || '';
        console.log(
          `✅ Found workspace member (last name): ${firstName} ${lastName} (ID: ${edge.node.id})`,
        );
        return edge.node.id;
      }
    }

    for (const edge of edges) {
      const firstName = edge.node.name?.firstName || '';
      const lastName = edge.node.name?.lastName || '';
      const fullName = `${firstName} ${lastName}`.trim().toLowerCase();

      if (fullName.includes(searchName) || searchName.includes(fullName)) {
        console.log(
          `✅ Found workspace member (partial): ${firstName} ${lastName} (ID: ${edge.node.id})`,
        );
        return edge.node.id;
      }
    }

    console.log(`⚠️ No workspace member found matching: "${name}"`);
    return null;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorMessage = error.response?.data
        ? JSON.stringify(error.response.data, null, 2)
        : error.message;
      console.error(
        `❌ Failed to lookup workspace member "${name}": ${errorMessage}`,
      );
    }
    return null;
  }
};

const lookupPersonByName = async (name: string): Promise<string | null> => {
  const { apiKey, baseUrl } = getTwentyApiConfig();

  try {
    const graphqlQuery = {
      query: `
        query GetAllPeople {
          people {
            edges {
              node {
                id
                name {
                  firstName
                  lastName
                }
              }
            }
          }
        }
      `,
    };

    const response = await axios.post(`${baseUrl}/graphql`, graphqlQuery, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
    });

    const edges = response.data?.data?.people?.edges;

    if (!edges || edges.length === 0) {
      console.log('⚠️ No people found in CRM');
      return null;
    }

    const searchName = name.trim().toLowerCase();

    for (const edge of edges) {
      const firstName = edge.node.name?.firstName || '';
      const lastName = edge.node.name?.lastName || '';
      const fullName = `${firstName} ${lastName}`.trim().toLowerCase();

      if (fullName === searchName) {
        console.log(
          `✅ Found person (exact): ${firstName} ${lastName} (ID: ${edge.node.id})`,
        );
        return edge.node.id;
      }
    }

    for (const edge of edges) {
      const firstName = edge.node.name?.firstName || '';
      if (firstName.toLowerCase() === searchName) {
        const lastName = edge.node.name?.lastName || '';
        console.log(
          `✅ Found person (first name): ${firstName} ${lastName} (ID: ${edge.node.id})`,
        );
        return edge.node.id;
      }
    }

    for (const edge of edges) {
      const lastName = edge.node.name?.lastName || '';
      if (lastName.toLowerCase() === searchName) {
        const firstName = edge.node.name?.firstName || '';
        console.log(
          `✅ Found person (last name): ${firstName} ${lastName} (ID: ${edge.node.id})`,
        );
        return edge.node.id;
      }
    }

    for (const edge of edges) {
      const firstName = edge.node.name?.firstName || '';
      const lastName = edge.node.name?.lastName || '';
      const fullName = `${firstName} ${lastName}`.trim().toLowerCase();

      if (fullName.includes(searchName) || searchName.includes(fullName)) {
        console.log(
          `✅ Found person (partial): ${firstName} ${lastName} (ID: ${edge.node.id})`,
        );
        return edge.node.id;
      }
    }

    console.log(`⚠️ No person found matching: "${name}"`);
    return null;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorMessage = error.response?.data
        ? JSON.stringify(error.response.data, null, 2)
        : error.message;
      console.error(`❌ Failed to lookup person "${name}": ${errorMessage}`);
    }
    return null;
  }
};

const extractPersonNamesFromDescription = (
  description: string,
  participants: string[],
): string[] => {
  const foundNames: string[] = [];

  for (const participant of participants) {
    if (description.includes(participant)) {
      foundNames.push(participant);
      continue;
    }

    const firstName = participant.split(' ')[0];
    if (firstName && description.includes(firstName)) {
      foundNames.push(participant);
    }
  }

  return foundNames;
};

const formatNoteBody = (summary: string, keyPoints: string[]): string => {
  const keyPointsList = keyPoints.map((point) => `- ${point}`).join('\n');
  return `## Summary\n\n${summary}\n\n## Key Points\n\n${keyPointsList}\n\n*Generated from meeting transcript*`;
};

const linkNoteToPersonREST = async (
  noteId: string,
  personId: string,
): Promise<void> => {
  const { apiKey, baseUrl } = getTwentyApiConfig();

  try {
    const response = await axios.post(
      `${baseUrl}/rest/noteTargets`,
      {
        noteId: noteId,
        personId: personId,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
      },
    );

    const noteTargetId = response.data?.data?.createNoteTarget?.id;

    if (noteTargetId) {
      console.log(
        `✅ Successfully linked note ${noteId} to person ${personId} (noteTarget: ${noteTargetId})`,
      );
    } else {
      console.warn(`⚠️ Note linking response received but no ID found`);
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorMessage = error.response?.data
        ? JSON.stringify(error.response.data, null, 2)
        : error.message;
      const status = error.response?.status;
      console.error(
        `❌ Failed to link note to person. Status: ${status}, Error: ${errorMessage}`,
      );
      console.error(
        `Attempted to link noteId: ${noteId} to personId: ${personId}`,
      );
      throw new Error(`Failed to link note to person: ${errorMessage}`);
    }
    throw error;
  }
};

const createNoteInTwenty = async (
  summary: string,
  keyPoints: string[],
  relatedPersonId: string,
  meetingTitle?: string,
  meetingDate?: string,
): Promise<TwentyApiResponse> => {
  const { apiKey, baseUrl } = getTwentyApiConfig();
  const noteTitle =
    meetingTitle ||
    `Meeting Notes - ${meetingDate || new Date().toLocaleDateString()}`;
  const noteBodyMarkdown = formatNoteBody(summary, keyPoints);

  const requestData = {
    title: noteTitle,
    bodyV2: {
      markdown: noteBodyMarkdown,
      blocknote: null,
    } satisfies RichTextV2Data,
  };

  try {
    const response = await axios.post(`${baseUrl}/rest/notes`, requestData, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
    });

    const responseJson = JSON.stringify(response.data);
    console.log('📦 Note API Response:', responseJson);

    const noteId = response.data?.data?.createNote?.id;

    if (!noteId) {
      const errorMsg = `Note created but ID not found in response. Response structure: ${responseJson}`;
      console.error('❌', errorMsg);
      throw new Error(errorMsg);
    }

    console.log(`✅ Note ID extracted: ${noteId}`);

    await linkNoteToPersonREST(noteId, relatedPersonId);

    return { id: noteId };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorMessage = error.response?.data
        ? JSON.stringify(error.response.data, null, 2)
        : error.message;
      const status = error.response?.status;
      throw new Error(
        `Failed to create note: ${errorMessage}. Status: ${status}`,
      );
    }
    throw error;
  }
};

const linkTaskToPersonREST = async (
  taskId: string,
  personId: string,
): Promise<void> => {
  const { apiKey, baseUrl } = getTwentyApiConfig();

  try {
    const response = await axios.post(
      `${baseUrl}/rest/taskTargets`,
      {
        taskId: taskId,
        personId: personId,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
      },
    );
    console.log(
      `✅ Successfully linked task ${taskId} to person ${personId}`,
      response.data,
    );
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorMessage = error.response?.data
        ? JSON.stringify(error.response.data, null, 2)
        : error.message;
      const status = error.response?.status;
      console.error(
        `❌ Failed to link task to person. Status: ${status}, Error: ${errorMessage}`,
      );
      console.error(
        `Attempted to link taskId: ${taskId} to personId: ${personId}`,
      );
    }
  }
};

const createTaskInTwenty = async (
  actionItem: ActionItem,
  relatedPersonId?: string,
): Promise<TwentyApiResponse> => {
  const { apiKey, baseUrl } = getTwentyApiConfig();

  const taskData: {
    title: string;
    bodyV2: RichTextV2Data;
    dueAt?: string;
    assigneeId?: string;
  } = {
    title: actionItem.title,
    bodyV2: {
      markdown: actionItem.description,
      blocknote: null,
    },
  };

  if (actionItem.assignee) {
    console.log(`🔍 Looking up assignee: "${actionItem.assignee}"`);
    const assigneeId = await lookupWorkspaceMemberByName(actionItem.assignee);
    if (assigneeId) {
      taskData.assigneeId = assigneeId;
      console.log(
        `✅ Task will be assigned to: ${actionItem.assignee} (${assigneeId})`,
      );
    } else {
      console.log(
        `⚠️ Could not find workspace member "${actionItem.assignee}", task will be unassigned`,
      );
    }
  }

  if (actionItem.dueDate) {
    const date = new Date(actionItem.dueDate);
    if (!isNaN(date.getTime())) {
      taskData.dueAt = date.toISOString();
    }
  }

  try {
    const response = await axios.post(`${baseUrl}/rest/tasks`, taskData, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
    });

    console.log('📦 Task API Response:', JSON.stringify(response.data));

    const taskId = response.data?.data?.createTask?.id;

    if (!taskId) {
      console.error(
        '❌ Failed to extract task ID from response:',
        response.data,
      );
      throw new Error('Task created but ID not found in response');
    }

    console.log(
      `✅ Task created successfully: ${taskId} - "${actionItem.title}"`,
    );

    if (relatedPersonId) {
      await linkTaskToPersonREST(taskId, relatedPersonId);
    }

    return { id: taskId };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorMessage = error.response?.data
        ? JSON.stringify(error.response.data, null, 2)
        : error.message;
      const status = error.response?.status;
      console.error(
        `❌ Failed to create task "${actionItem.title}". Status: ${status}, Error: ${errorMessage}`,
      );
      throw new Error(
        `Failed to create task "${actionItem.title}": ${errorMessage}. Status: ${status}`,
      );
    }
    throw error;
  }
};

const createTasksFromActionItems = async (
  actionItems: ActionItem[],
  noteId: string,
  relatedPersonId: string,
  participants: string[],
): Promise<string[]> => {
  const taskIds: string[] = [];

  for (const actionItem of actionItems) {
    try {
      const taskDescription = `${actionItem.description}\n\n*Related to meeting note: ${noteId}*`;
      console.log(`Creating task: "${actionItem.title}"`);

      const mentionedPeople = extractPersonNamesFromDescription(
        actionItem.description,
        participants,
      );
      console.log(`📝 People mentioned in task description:`, mentionedPeople);

      const task = await createTaskInTwenty({
        ...actionItem,
        description: taskDescription,
      });
      taskIds.push(task.id);
      console.log(`✅ Task created: ${task.id}`);

      if (mentionedPeople.length > 0) {
        for (const personName of mentionedPeople) {
          const personId = await lookupPersonByName(personName);
          if (personId) {
            await linkTaskToPersonREST(task.id, personId);
          } else {
            console.log(
              `⚠️ Could not find person "${personName}" in CRM, skipping link`,
            );
          }
        }
      } else {
        console.log(
          `⚠️ No specific people mentioned, using relatedPersonId as fallback`,
        );
        await linkTaskToPersonREST(task.id, relatedPersonId);
      }

      console.log(`✅ Task linking complete: ${task.id}`);
    } catch (error) {
      console.error(
        `❌ Task creation failed for "${actionItem.title}":`,
        error instanceof Error ? error.message : error,
      );
    }
  }

  return taskIds;
};

const createTasksFromCommitments = async (
  commitments: Commitment[],
  noteId: string,
  relatedPersonId: string,
): Promise<string[]> => {
  const taskIds: string[] = [];

  for (const commitment of commitments) {
    try {
      const taskDescription = `Commitment from ${commitment.person}: ${commitment.commitment}\n\n*Related to meeting note: ${noteId}*`;
      const task = await createTaskInTwenty({
        title: `Follow up: ${commitment.commitment}`,
        description: taskDescription,
        assignee: commitment.person,
        dueDate: commitment.dueDate || '',
      });
      taskIds.push(task.id);

      const personId = await lookupPersonByName(commitment.person);
      if (personId) {
        await linkTaskToPersonREST(task.id, personId);
      } else {
        await linkTaskToPersonREST(task.id, relatedPersonId);
      }
    } catch (error) {
      console.error(
        `Commitment task creation failed for "${commitment.commitment}":`,
        error,
      );
    }
  }

  return taskIds;
};

const analyzeTranscript = async (
  transcript: string,
  openaiApiKey: string,
): Promise<AnalysisResult> => {
  const prompt = `Analyze the following meeting transcript and extract:
1. A concise summary (2-3 sentences)
2. Key discussion points (bullet list)
3. Action items with titles, descriptions, and any mentioned assignees or due dates

🚨 CRITICAL RULE FOR ACTION ITEMS - READ CAREFULLY:
When multiple people are mentioned working on THE SAME deliverable/document/outcome:
→ Create EXACTLY ONE task that represents the complete workflow
→ The task title should describe the MAIN deliverable (what needs to be completed)
→ Assign to the person who will do the FINAL/CRITICAL step (approver, reviewer, coordinator)
→ The description MUST mention ALL people involved and their roles

STRICT EXAMPLES - Follow this pattern exactly:

Example 1:
Transcript: "Brian will finalize the investor deck. Irfan will review it before the presentation next Monday."
❌ WRONG OUTPUT (2 tasks):
  Task 1: {"title": "Finalize investor deck", "assignee": "Brian", "description": "Brian will finalize..."}
  Task 2: {"title": "Review investor deck", "assignee": "Irfan", "description": "Irfan will review..."}

✅ CORRECT OUTPUT (1 task):
  Task 1: {
    "title": "Finalize and present investor deck",
    "assignee": "Irfan",
    "dueDate": "2025-11-03",
    "description": "Brian Chesky is designated to finalize the investor deck layout and needs to present it next Monday. Irfan will review the deck before the presentation."
  }

Example 2:
Transcript: "Dario will review security protocols before end of week. Iqra will coordinate the security review process."
❌ WRONG OUTPUT (2 tasks):
  Task 1: {"title": "Review security protocols", "assignee": "Dario", ...}
  Task 2: {"title": "Coordinate security review", "assignee": "Iqra", ...}

✅ CORRECT OUTPUT (1 task):
  Task 1: {
    "title": "Coordinate security protocol review",
    "assignee": "Iqra",
    "dueDate": "2025-11-07",
    "description": "Dario Amodei will personally review the security protocols for the AI model before the end of the week. Iqra Khan will coordinate the security review process."
  }

KEY RULES:
1. If multiple people mentioned for same deliverable → ONE task only
2. Task title = main deliverable/outcome
3. Assignee = person doing final/critical step (reviewer, approver, coordinator, presenter)
4. Description = full context with ALL people and their roles mentioned
5. DO NOT split workflows into multiple tasks
6. Look for keywords: "and then", "before", "after", "will review", "will coordinate", "will approve"
7. IMPORTANT: Do NOT extract commitments separately - include all commitments as part of action items

For assignees (MANDATORY - always extract if possible):
- ALWAYS assign the task to someone if ANY person is mentioned doing work
- Priority order: reviewer > creator, coordinator > contributor, approver > submitter, presenter > preparer
- Look for: "X will", "assigned to X", "X is responsible", "X to review/approve/coordinate/present"
- Examples of who to assign:
  * "Brian will finalize, Irfan will review" → Assign to Irfan (reviewer)
  * "Dario will review, Iqra will coordinate" → Assign to Iqra (coordinator)
  * "Sarah will create report" → Assign to Sarah
- If only ONE person mentioned → assign to them
- If MULTIPLE people mentioned → assign to the one doing the FINAL/CRITICAL step

For due dates (MANDATORY - always extract if possible):
- ALWAYS include dueDate if ANY time reference is mentioned
- Current date context: Meeting date is 2025-11-01 (Saturday)
- Convert relative dates to YYYY-MM-DD format:
  * "next Monday" → "2025-11-03"
  * "this Friday" → "2025-11-07"
  * "end of week" → "2025-11-07" (Friday)
  * "end of month" → "2025-11-30"
  * "next week" → "2025-11-08" (7 days from meeting)
  * "in 3 days" → "2025-11-04"
- If specific date mentioned: "November 10" → "2025-11-10"
- Use the LATEST date mentioned if multiple dates in the workflow

Return JSON with this structure (NOTE: commitments array should always be EMPTY):
{
  "summary": "string",
  "keyPoints": ["string"],
  "actionItems": [{"title": "string", "description": "string", "assignee": "string", "dueDate": "YYYY-MM-DD"}],
  "commitments": []
}

Transcript:
${transcript}`;

  const completion = await openai.chat.completions.create({
    model: LLM_MODEL_ID,
    messages: [
      {
        role: 'system',
        content:
          'You are a meeting analysis assistant. When multiple people work on the same deliverable, create ONE task (not multiple). ALWAYS assign tasks to someone and ALWAYS extract due dates when time references are mentioned. Include all commitments as action items. Commitments array should always be empty. Always return valid JSON.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
    response_format: { type: 'json_object' },
    temperature: OPENAI_TEMPERATURE,
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) {
    throw new Error('No response from AI API');
  }

  let parsedResult: AnalysisResult;
  try {
    parsedResult = JSON.parse(content) as AnalysisResult;
  } catch (error) {
    throw new Error(
      `Failed to parse AI response as JSON: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }

  if (!parsedResult.summary || typeof parsedResult.summary !== 'string') {
    throw new Error('Invalid AI response: missing or invalid summary');
  }
  if (!Array.isArray(parsedResult.keyPoints)) {
    throw new Error('Invalid AI response: keyPoints must be an array');
  }
  if (!Array.isArray(parsedResult.actionItems)) {
    throw new Error('Invalid AI response: actionItems must be an array');
  }
  if (!Array.isArray(parsedResult.commitments)) {
    throw new Error('Invalid AI response: commitments must be an array');
  }

  return parsedResult;
};

export const main = async (
  params: TranscriptWebhookPayload,
): Promise<object> => {
  const executionLogs: string[] = [];
  const log = (message: string) => {
    console.log(message);
    executionLogs.push(message);
  };

  try {
    const webhookToken = params.token;
    const expectedSecret = process.env.WEBHOOK_SECRET_TOKEN;

    if (!expectedSecret || !webhookToken || webhookToken !== expectedSecret) {
      throw new Error('Unauthorized webhook access: Invalid or missing token.');
    }

    const {
      transcript,
      meetingTitle,
      meetingDate,
      relatedPersonId,
      participants,
    } = params;

    if (!transcript || typeof transcript !== 'string') {
      throw new Error('Transcript is required and must be a string');
    }

    if (!relatedPersonId || typeof relatedPersonId !== 'string') {
      throw new Error('relatedPersonId is required and must be a string');
    }

    const openaiApiKey = process.env.AI_PROVIDER_API_KEY;
    if (!openaiApiKey) {
      throw new Error('AI_PROVIDER_API_KEY environment variable is not set');
    }

    log('✅ Validation passed');
    log(`📝 RelatedPersonId: ${relatedPersonId}`);
    log('🤖 Starting transcript analysis...');

    const analysis = await analyzeTranscript(transcript, openaiApiKey);
    log(
      `✅ Analysis complete: ${analysis.actionItems.length} action items, ${analysis.commitments.length} commitments`,
    );

    log('📄 Creating note in Twenty CRM...');
    const note = await createNoteInTwenty(
      analysis.summary,
      analysis.keyPoints,
      relatedPersonId,
      meetingTitle,
      meetingDate,
    );
    log(`✅ Note created: ${note.id}`);

    log('📋 Creating tasks from action items...');
    const actionItemTaskIds = await createTasksFromActionItems(
      analysis.actionItems,
      note.id,
      relatedPersonId,
      participants || [],
    );
    log(`✅ Action item tasks created: ${actionItemTaskIds.length}`);

    log('📋 Creating tasks from commitments...');
    const commitmentTaskIds = await createTasksFromCommitments(
      analysis.commitments,
      note.id,
      relatedPersonId,
    );
    log(`✅ Commitment tasks created: ${commitmentTaskIds.length}`);

    const allTaskIds = [...actionItemTaskIds, ...commitmentTaskIds];

    return {
      success: true,
      noteId: note.id,
      taskIds: allTaskIds,
      summary: {
        noteCreated: true,
        tasksCreated: allTaskIds.length,
        actionItemsProcessed: analysis.actionItems.length,
        commitmentsProcessed: analysis.commitments.length,
      },
      executionLogs: executionLogs,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    log(`❌ ERROR: ${errorMessage}`);
    return {
      success: false,
      error: errorMessage,
      executionLogs: executionLogs,
    };
  }
};

export const config: ServerlessFunctionConfig = {
  universalIdentifier: 'b5e86982-b9ec-4c3d-8a02-6ea08a5b2d35',
  name: 'process-transcript',
  triggers: [
    {
      universalIdentifier: 'a25fcbbf-1a20-438a-b277-ee8ca9770499',
      type: 'route',
      path: '/transcript',
      httpMethod: 'POST',
      isAuthRequired: true,
    },
  ],
};
