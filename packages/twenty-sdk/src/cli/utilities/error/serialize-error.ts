import axios from 'axios';

const safeStringify = (value: unknown): string => {
  try {
    const stringified = JSON.stringify(value, null, 2);

    if (stringified === '{}' || stringified === undefined) {
      return String(value);
    }

    return stringified;
  } catch {
    return String(value);
  }
};

export const serializeError = (error: unknown): string => {
  if (typeof error === 'string') {
    return error;
  }

  if (axios.isAxiosError(error)) {
    const parts: string[] = [];
    const status = error.response?.status;
    const statusText = error.response?.statusText;

    if (status) {
      parts.push(`HTTP ${status}${statusText ? ` ${statusText}` : ''}`);
    }

    const responseData = error.response?.data;
    const graphqlErrors = responseData?.errors;

    if (Array.isArray(graphqlErrors) && graphqlErrors.length > 0) {
      const messages = graphqlErrors
        .map((graphqlError: { message?: unknown }) => {
          if (typeof graphqlError.message === 'string') {
            return graphqlError.message;
          }

          return safeStringify(graphqlError);
        })
        .join('; ');

      parts.push(messages);
    } else if (responseData?.message) {
      parts.push(
        typeof responseData.message === 'string'
          ? responseData.message
          : safeStringify(responseData.message),
      );
    } else if (responseData) {
      parts.push(safeStringify(responseData));
    } else if (error.message) {
      parts.push(error.message);
    }

    if (error.code) {
      parts.push(`(${error.code})`);
    }

    return parts.join(' - ') || 'Unknown Axios error';
  }

  if (error instanceof Error) {
    return error.message || error.toString();
  }

  return safeStringify(error);
};
