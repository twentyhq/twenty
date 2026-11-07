import { buildNonSystemCoreObjectFilterSettings } from '@/object-core/filters/utils/buildNonSystemCoreObjectFilterSettings';
import { CoreWorkflowFilterFieldKey } from '~/generated/graphql';

export const CORE_WORKFLOWS_DEFAULT_FILTER_SETTINGS =
  buildNonSystemCoreObjectFilterSettings(CoreWorkflowFilterFieldKey.IS_SYSTEM);
