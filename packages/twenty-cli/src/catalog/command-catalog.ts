import { APP_DEV_COMMAND_DEFINITION } from '@/commands/app/dev/app-dev.command-definition';
import { APP_ADD_COMMAND_DEFINITION } from '@/commands/app/add/app-add.command-definition';
import { APP_EXEC_COMMAND_DEFINITION } from '@/commands/app/exec/app-exec.command-definition';
import { APP_LOGS_COMMAND_DEFINITION } from '@/commands/app/function-logs/app-logs.command-definition';
import { type CommandDefinition } from '@/catalog/types/command-definition.type';
import { APP_APPLY_COMMAND_DEFINITION } from '@/commands/app/apply/app-apply.command-definition';
import { APP_BUILD_COMMAND_DEFINITION } from '@/commands/app/build/app-build.command-definition';
import { APP_INIT_COMMAND_DEFINITION } from '@/commands/app/init/app-init.command-definition';
import { APP_PULL_COMMAND_DEFINITION } from '@/commands/app/pull/app-pull.command-definition';
import { APP_PLAN_COMMAND_DEFINITION } from '@/commands/app/plan/app-plan.command-definition';
import { APP_TYPECHECK_COMMAND_DEFINITION } from '@/commands/app/typecheck/app-typecheck.command-definition';
import { APP_UNINSTALL_COMMAND_DEFINITION } from '@/commands/app/uninstall/app-uninstall.command-definition';
import { AUTH_LOGIN_COMMAND_DEFINITION } from '@/commands/auth/login/auth-login.command-definition';
import { AUTH_LOGOUT_COMMAND_DEFINITION } from '@/commands/auth/logout/auth-logout.command-definition';
import { AUTH_STATUS_COMMAND_DEFINITION } from '@/commands/auth/status/auth-status.command-definition';
import { AUTH_TOKEN_COMMAND_DEFINITION } from '@/commands/auth/token/auth-token.command-definition';
import { API_GRAPHQL_COMMAND_DEFINITION } from '@/commands/api/graphql/api-graphql.command-definition';
import { API_REST_COMMAND_DEFINITION } from '@/commands/api/rest/api-rest.command-definition';
import { COMMANDS_COMMAND_DEFINITION } from '@/commands/commands/commands.command-definition';
import { DATA_GET_COMMAND_DEFINITION } from '@/commands/data/get/data-get.command-definition';
import { DATA_LIST_COMMAND_DEFINITION } from '@/commands/data/list/data-list.command-definition';
import { DOCTOR_COMMAND_DEFINITION } from '@/commands/doctor/doctor.command-definition';
import { METADATA_OBJECT_DESCRIBE_COMMAND_DEFINITION } from '@/commands/metadata/object/describe/metadata-object-describe.command-definition';
import { METADATA_FIELD_LIST_COMMAND_DEFINITION } from '@/commands/metadata/field/list/metadata-field-list.command-definition';
import { METADATA_FIELD_DESCRIBE_COMMAND_DEFINITION } from '@/commands/metadata/field/describe/metadata-field-describe.command-definition';
import { METADATA_OBJECT_LIST_COMMAND_DEFINITION } from '@/commands/metadata/object/list/metadata-object-list.command-definition';
import { OPEN_COMMAND_DEFINITION } from '@/commands/open/open.command-definition';
import { REMOTE_LIST_COMMAND_DEFINITION } from '@/commands/remote/list/remote-list.command-definition';
import { REMOTE_REMOVE_COMMAND_DEFINITION } from '@/commands/remote/remove/remote-remove.command-definition';
import { REMOTE_RENAME_COMMAND_DEFINITION } from '@/commands/remote/rename/remote-rename.command-definition';
import { REMOTE_USE_COMMAND_DEFINITION } from '@/commands/remote/use/remote-use.command-definition';
import { VERSION_COMMAND_DEFINITION } from '@/commands/version/version.command-definition';

export const COMMAND_CATALOG: CommandDefinition[] = [
  APP_ADD_COMMAND_DEFINITION,
  APP_APPLY_COMMAND_DEFINITION,
  APP_DEV_COMMAND_DEFINITION,
  APP_EXEC_COMMAND_DEFINITION,
  APP_LOGS_COMMAND_DEFINITION,
  APP_BUILD_COMMAND_DEFINITION,
  APP_INIT_COMMAND_DEFINITION,
  APP_PLAN_COMMAND_DEFINITION,
  APP_PULL_COMMAND_DEFINITION,
  APP_TYPECHECK_COMMAND_DEFINITION,
  APP_UNINSTALL_COMMAND_DEFINITION,
  AUTH_LOGIN_COMMAND_DEFINITION,
  AUTH_LOGOUT_COMMAND_DEFINITION,
  AUTH_STATUS_COMMAND_DEFINITION,
  AUTH_TOKEN_COMMAND_DEFINITION,
  REMOTE_LIST_COMMAND_DEFINITION,
  REMOTE_USE_COMMAND_DEFINITION,
  REMOTE_RENAME_COMMAND_DEFINITION,
  REMOTE_REMOVE_COMMAND_DEFINITION,
  API_GRAPHQL_COMMAND_DEFINITION,
  API_REST_COMMAND_DEFINITION,
  COMMANDS_COMMAND_DEFINITION,
  DATA_LIST_COMMAND_DEFINITION,
  DATA_GET_COMMAND_DEFINITION,
  DOCTOR_COMMAND_DEFINITION,
  METADATA_OBJECT_LIST_COMMAND_DEFINITION,
  METADATA_OBJECT_DESCRIBE_COMMAND_DEFINITION,
  METADATA_FIELD_LIST_COMMAND_DEFINITION,
  METADATA_FIELD_DESCRIBE_COMMAND_DEFINITION,
  OPEN_COMMAND_DEFINITION,
  VERSION_COMMAND_DEFINITION,
];
