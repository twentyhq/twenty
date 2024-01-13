import { Status } from '@/ui/display/status/components/Status';

import { usePipelineStepField } from '../../hooks/usePipelineStepField';

export const PipelineStepDisplay = () => {
  const { fieldValue } = usePipelineStepField();

  return <Status color={fieldValue.color} text={fieldValue.label} />;
};
