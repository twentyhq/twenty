import { isNumber, isObject, isString } from '@sniptt/guards';

export class UnipileRequestError extends Error {
  readonly status: number | undefined;

  constructor(message: string, status: number | undefined) {
    super(message);
    this.name = 'UnipileRequestError';
    this.status = status;
  }
}

// The Unipile client throws its JSON error body as a plain object, which Twenty logs as [object Object]
export const withUnipileErrorContext = async <TResult>(
  requestName: string,
  request: () => Promise<TResult>,
): Promise<TResult> => {
  try {
    return await request();
  } catch (error) {
    if (error instanceof Error || !isObject(error)) {
      throw error;
    }

    const { status, title, detail } = error as {
      status?: unknown;
      title?: unknown;
      detail?: unknown;
    };
    const reason = [title, detail].filter(isString).join(': ');

    throw new UnipileRequestError(
      `Unipile ${requestName} failed${isNumber(status) ? ` (${status})` : ''}: ${reason || JSON.stringify(error)}`,
      isNumber(status) ? status : undefined,
    );
  }
};
