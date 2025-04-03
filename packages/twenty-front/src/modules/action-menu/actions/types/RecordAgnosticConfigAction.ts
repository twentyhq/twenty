import { RecordConfigAction } from '@/action-menu/actions/types/RecordConfigAction';

export type RecordAgnosticConfigAction = Omit<
  RecordConfigAction,
  'component'
> & {
  component: React.ComponentType;
};
