import { type Response } from 'express';

export const writeSseEvent = (
  response: Response,
  data: Record<string, unknown>,
): void => {
  response.write(`event: message\ndata: ${JSON.stringify(data)}\n\n`);
};
