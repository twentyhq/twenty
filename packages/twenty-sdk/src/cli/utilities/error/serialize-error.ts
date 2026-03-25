import axios from 'axios';

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

    const graphqlErrors = error.response?.data?.errors;

    if (Array.isArray(graphqlErrors) && graphqlErrors.length > 0) {
      const messages = graphqlErrors
        .map(
          (graphqlError: { message?: string }) =>
            graphqlError.message ?? 'Unknown GraphQL error',
        )
        .join('; ');

      parts.push(messages);
    } else if (error.response?.data?.message) {
      parts.push(error.response.data.message);
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

  const stringified = JSON.stringify(error, null, 2);

  if (stringified === '{}' || stringified === undefined) {
    return String(error);
  }

  return stringified;
};
