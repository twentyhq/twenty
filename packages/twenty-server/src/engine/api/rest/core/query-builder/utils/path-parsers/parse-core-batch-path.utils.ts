import { Request } from 'express';

export const parseCoreBatchPath = (request: Request): { object: string } => {
  return { object: request.path.replace('/rest/batch/', '') };
};
