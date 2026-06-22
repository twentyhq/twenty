import type {
  CreateIssueInput,
  CreateIssueResult,
  MulticaIssue,
} from 'src/logic-functions/types/multica.types';

const WORKSPACE_ID = 'd11337e4-0c4e-43b8-8fc8-8216c70f1427';
const PROJECT_ID = 'fb2e3c0e-27e0-47ac-b86d-3d2e18832fd6';

export const createMulticaIssueHandler = async (
  input: CreateIssueInput,
): Promise<CreateIssueResult> => {
  const apiKey = process.env.MULTICA_API_KEY;

  if (!apiKey) {
    return {
      success: false,
      error: 'Missing MULTICA_API_KEY environment variable.',
    };
  }

  if (!input.title || input.title.trim().length === 0) {
    return {
      success: false,
      error: '`title` is required.',
    };
  }

  try {
    const twentyMetadata = input.metadata ?? {
      source: 'twenty-multica-tickets',
      app_version: '0.1.0',
      created_via: 'api',
    };

    const response = await fetch(
      `https://api.multica.ai/api/issues?workspace_id=${WORKSPACE_ID}`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: input.title,
          description: input.description,
          priority: input.priority,
          status: input.status,
          project_id: PROJECT_ID,
          assignee_id: input.assignee_id,
          parent_issue_id: input.parent_issue_id,
          start_date: input.start_date,
          due_date: input.due_date,
          metadata: twentyMetadata,
        }),
      },
    );

    if (!response.ok) {
      const errorBody = await response.text().catch(() => 'Unknown error');
      return {
        success: false,
        error: `Multica API returned ${response.status}: ${errorBody}`,
      };
    }

    const issue = (await response.json()) as MulticaIssue;
    return { success: true, issue };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'Unknown network error';
    return { success: false, error: message };
  }
};
