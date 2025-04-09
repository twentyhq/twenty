import { ActionHookWithoutObjectMetadataItem } from '@/action-menu/actions/types/ActionHook';
import { RecordConfigAction } from '@/action-menu/actions/types/RecordConfigAction';

export type RecordAgnosticConfigAction = Omit<
  RecordConfigAction,
  'useAction'
> & {
  useAction: ActionHookWithoutObjectMetadataItem;
};
