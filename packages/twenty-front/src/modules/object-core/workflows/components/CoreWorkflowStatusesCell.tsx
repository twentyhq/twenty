import { MultiSelectDisplay } from '@/ui/field/display/components/MultiSelectDisplay';
import { useCoreWorkflowStatusOptions } from '@/object-core/workflows/hooks/useCoreWorkflowStatusOptions';

type CoreWorkflowStatusesCellProps = {
  statuses: string[];
};

export const CoreWorkflowStatusesCell = ({
  statuses,
}: CoreWorkflowStatusesCellProps) => {
  const statusOptions = useCoreWorkflowStatusOptions();

  return <MultiSelectDisplay values={statuses} options={statusOptions} />;
};
