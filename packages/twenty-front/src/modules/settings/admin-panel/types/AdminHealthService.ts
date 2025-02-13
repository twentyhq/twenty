import { HealthService } from '~/generated/graphql';

export type AdminHealthService = HealthService & { id: string; name: string };
