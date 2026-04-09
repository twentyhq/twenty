import { type Response } from 'express';

export const writeSseEvent = (
  response: Response,
  data: Record<string, unknown>,
): void => {
  // Ensure non-HTML content type so user data serialized as JSON cannot trigger XSS
  if (!response.headersSent) {
    response.setHeader('Content-Type', 'text/event-stream');
    response.setHeader('X-Content-Type-Options', 'nosniff');
  }

  response.write(`event: message\ndata: ${JSON.stringify(data)}\n\n`);
};
