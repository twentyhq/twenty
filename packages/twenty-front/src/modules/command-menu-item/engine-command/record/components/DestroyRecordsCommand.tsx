import { BaseDestroyRecordsCommand } from '@/command-menu-item/engine-command/record/components/BaseDestroyRecordsCommand';

export const DestroyRecordsCommand = () => (
  <BaseDestroyRecordsCommand requireSoftDeleted={true} />
);
