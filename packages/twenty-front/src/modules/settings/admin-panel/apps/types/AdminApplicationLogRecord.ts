import { type FindAdminApplicationRegistrationLogsQuery } from '~/generated-admin/graphql';

export type AdminApplicationLogRecord =
  FindAdminApplicationRegistrationLogsQuery['findAdminApplicationRegistrationLogs']['records'][number];
