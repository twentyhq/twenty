// index.ts

import axios from 'axios';
import OpenAI from 'openai';

// --- TYPES (Adhering to Twenty's Principles) ---

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

// --- CONFIGURATION ---
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const WEBHOOK_SECRET_TOKEN = process.env.WEBHOOK_SECRET_TOKEN;
const TWENTY_API_URL = process.env.TWENTY_API_URL;
const GROQ_API_BASE_URL = process.env.GROQ_API_BASE_URL;

const LLM_MODEL_ID = 'openai/gpt-oss-20b';
const OPENAI_TEMPERATURE = 0.3;

// --- UTILITY FUNCTIONS (CRM Logic) ---

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

const formatNoteBody = (summary: string, keyPoints: string[]): string => {
  const keyPointsList = keyPoints.map((point) => `- ${point}`).join('\n');
  return `## Summary\n\n${summary}\n\n## Key Points\n\n${keyPointsList}\n\n*Generated from meeting transcript*`;
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

    // Link the note to the person using noteTargets
    if (relatedPersonId) {
      try {
        const noteTargetData = {
          noteId: data.id,
          personId: relatedPersonId,
        };

        await axios.post(
          `${baseUrl}/rest/noteTargets`,
          noteTargetData,
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${apiKey}`,
            },
          },
        );
      } catch (linkError) {
        console.warn('Failed to link note to person (non-critical):', (linkError as any).message);
      }
    }

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
    const date = new Date(actionItem.dueDate);
    if (!isNaN(date.getTime())) {
      taskData.dueAt = date.toISOString();
    }
  }

  try {
    const response = await axios.post<TwentyApiResponse>(
      `${baseUrl}/rest/tasks`,
      taskData,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
      },
    );
    console.log('Task API Response:', JSON.stringify(response.data, null, 2));
    return response.data;
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
      console.error(`Failed to create action item task: ${actionItem.title}`, error);
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
      console.error(`Failed to create commitment task: ${commitment.commitment}`, error);
    }
  }

  return taskIds;
};

// --- CORE AI ANALYSIS FUNCTION ---

const analyzeTranscript = async (
  transcript: string,
  openaiApiKey: string,
): Promise<AnalysisResult> => {
  const groqBaseUrl = process.env.GROQ_API_BASE_URL;
  if (!groqBaseUrl) {
    throw new Error('GROQ_API_BASE_URL environment variable is not set');
  }

  const openai = new OpenAI({
    apiKey: openaiApiKey,
    baseURL: groqBaseUrl,
  });

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
    model: LLM_MODEL_ID,
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
    throw new Error('No response from AI API');
  }

  return JSON.parse(content) as AnalysisResult;
};

// --- MAIN SERVERLESS FUNCTION ENTRY POINT ---

export const main = async (
  params: TranscriptWebhookPayload,
): Promise<object> => {
  const webhookToken = params.token;
  const expectedSecret = process.env.WEBHOOK_SECRET_TOKEN;
  const relatedPersonId = params.relatedPersonId;

  if (webhookToken !== expectedSecret || !expectedSecret) {
    throw new Error('Unauthorized webhook access: Invalid or missing token.');
  }

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
    relatedPersonId,
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