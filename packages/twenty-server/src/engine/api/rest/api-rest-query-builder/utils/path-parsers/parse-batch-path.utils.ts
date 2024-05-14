import { Request } from 'express';

export const parseBatchPath = (request: Request): { object: string } => {
  return { object: request.path.replace('/rest/batch/', '') };
};
