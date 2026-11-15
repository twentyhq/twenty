import { type SELECTION_ARGUMENTS } from 'src/engine/api/graphql/workspace-resolver-builder/constants/selection-arguments.constant';
import { type SELECTION_FIELD_NAME } from 'src/engine/api/graphql/workspace-resolver-builder/constants/selection-field-name.constant';
import { type SELECTION_RESPONSE_KEY } from 'src/engine/api/graphql/workspace-resolver-builder/constants/selection-response-key.constant';

export type ResolverSelectedFields = {
  [SELECTION_FIELD_NAME]?: string;
  [SELECTION_ARGUMENTS]?: Record<string, unknown>;
  [SELECTION_RESPONSE_KEY]?: string;
  // oxlint-disable-next-line typescript/no-explicit-any
  [responseKey: string]: any;
};
