import { BaseDestroyRecordsCommand } from '@/command-menu-item/engine-command/record/components/BaseDestroyRecordsCommand';

export const PermanentlyDeleteRecordsCommand = () => (
  <BaseDestroyRecordsCommand requireSoftDeleted={false} />
);
