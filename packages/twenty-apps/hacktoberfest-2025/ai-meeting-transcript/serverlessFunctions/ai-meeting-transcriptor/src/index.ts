import axios from 'axios';
import OpenAI from 'openai';
import { type ServerlessFunctionConfig } from 'twenty-sdk/application';

type TranscriptWebhookPayload = {
  transcript: string;
  meetingTitle?: string;
  meetingDate?: string;
  participants?: string[];
  metadata?: Record<string, unknown>;
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

const OPENAI_MODEL = 'gpt-4o-mini';
const OPENAI_TEMPERATURE = 0.3;

const analyzeTranscript = async (
  transcript: string,
  openaiApiKey: string,
): Promise<AnalysisResult> => {
  const openai = new OpenAI({ apiKey: openaiApiKey });

  const prompt = `Analyze the following meeting transcript and extract:
1. A concise summary (2-3 sentences)
2. Key discussion points (bullet list)
3. Action items with titles, descriptions, and any mentioned assignees or due dates
4. Commitments made by participants with names and any mentioned due dates

Return the response as a JSON object with this structure:
{
  "summary": "string",
  "keyPoints": ["string"],
  "actionItems": [{"title": "string", "description": "string", "assignee": "string (optional)", "dueDate": "string (optional)"}],
  "commitments": [{"person": "string", "commitment": "string", "dueDate": "string (optional)"}]
}

Transcript:
${transcript}`;

  const completion = await openai.chat.completions.create({
    model: OPENAI_MODEL,
    messages: [
      {
        role: 'system',
        content:
          'You are a meeting analysis assistant. Extract key insights, action items, and commitments from meeting transcripts. Always return valid JSON.',
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
    throw new Error('No response from OpenAI');
  }

  return JSON.parse(content) as AnalysisResult;
};

const getTwentyApiConfig = () => {
  const apiKey = process.env.TWENTY_API_KEY;
  if (!apiKey) {
    throw new Error('TWENTY_API_KEY environment variable is not set');
  }

  const baseUrl = process.env.TWENTY_API_URL;

  return { apiKey, baseUrl };
};

const formatNoteBody = (summary: string, keyPoints: string[]): string => {
  const keyPointsList = keyPoints.map((point) => `- ${point}`).join('\n');
  return `## Summary\n\n${summary}\n\n## Key Points\n\n${keyPointsList}\n\n*Generated from meeting transcript*`;
};

const createNoteInTwenty = async (
  summary: string,
  keyPoints: string[],
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
    const { data } = await axios.post<TwentyApiResponse>(
      `${baseUrl}/rest/notes`,
      requestData,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
      },
    );
    return data;
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

const createTaskInTwenty = async (
  actionItem: ActionItem,
): Promise<TwentyApiResponse> => {
  const { apiKey, baseUrl } = getTwentyApiConfig();

  const taskData: {
    title: string;
    bodyV2: RichTextV2Data;
    dueAt?: string;
  } = {
    title: actionItem.title,
    bodyV2: {
      markdown: actionItem.description,
      blocknote: null,
    },
  };

  if (actionItem.dueDate) {
    taskData.dueAt = new Date(actionItem.dueDate).toISOString();
  }

  try {
    const { data } = await axios.post<TwentyApiResponse>(
      `${baseUrl}/rest/tasks`,
      taskData,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
      },
    );
    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorMessage = error.response?.data
        ? JSON.stringify(error.response.data, null, 2)
        : error.message;
      const status = error.response?.status;
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
): Promise<string[]> => {
  const taskIds: string[] = [];

  for (const actionItem of actionItems) {
    try {
      const taskDescription = `${actionItem.description}\n\n*Related to meeting note: ${noteId}*`;
      const task = await createTaskInTwenty({
        ...actionItem,
        description: taskDescription,
      });
      taskIds.push(task.id);
    } catch (error) {
      // Task creation failed, continue with next task
    }
  }

  return taskIds;
};

const createTasksFromCommitments = async (
  commitments: Commitment[],
  noteId: string,
): Promise<string[]> => {
  const taskIds: string[] = [];

  for (const commitment of commitments) {
    try {
      const taskDescription = `Commitment from ${commitment.person}: ${commitment.commitment}\n\n*Related to meeting note: ${noteId}*`;
      const task = await createTaskInTwenty({
        title: `Follow up: ${commitment.commitment}`,
        description: taskDescription,
        dueDate: commitment.dueDate,
      });
      taskIds.push(task.id);
    } catch (error) {
      // Commitment task creation failed, continue with next commitment
    }
  }

  return taskIds;
};

export const main = async (
  params: TranscriptWebhookPayload,
): Promise<object> => {
  const { transcript, meetingTitle, meetingDate } = params;

  if (!transcript || typeof transcript !== 'string') {
    throw new Error('Transcript is required and must be a string');
  }

  const openaiApiKey = process.env.OPENAI_API_KEY;
  if (!openaiApiKey) {
    throw new Error('OPENAI_API_KEY environment variable is not set');
  }

  const analysis = await analyzeTranscript(transcript, openaiApiKey);

  const note = await createNoteInTwenty(
    analysis.summary,
    analysis.keyPoints,
    meetingTitle,
    meetingDate,
  );

  const actionItemTaskIds = await createTasksFromActionItems(
    analysis.actionItems,
    note.id,
  );
  const commitmentTaskIds = await createTasksFromCommitments(
    analysis.commitments,
    note.id,
  );

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
  };
};

export const config: ServerlessFunctionConfig = {
  universalIdentifier: 'dae52ab2-174f-4f81-a031-604ee2e81eba',
  name: 'ai-meeting-transcriptor',
  triggers: [
    {
      universalIdentifier: 'b011303d-2c24-44d4-9923-55eb060a1ff6',
      type: 'route',
      path: '/webhook/transcript',
      httpMethod: 'POST',
      isAuthRequired: false,
    },
  ],
};
