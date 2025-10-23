import { type SyncableEntityOptions } from '@/decorators/types/syncable-entity-options.type';

enum HTTPMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  PATCH = 'PATCH',
  DELETE = 'DELETE',
}

type RouteTriggerOptions = SyncableEntityOptions & {
  path: string;
  httpMethod: HTTPMethod;
  isAuthRequired: boolean;
};

export const RouteTrigger = (_: RouteTriggerOptions): ClassDecorator => {
  return () => {};
};
