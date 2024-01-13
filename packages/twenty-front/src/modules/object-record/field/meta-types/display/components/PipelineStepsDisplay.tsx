import { Status } from '@/ui/display/status/components/Status';

import { usePipelineStepsField } from '../../hooks/usePipelineStepsField';

export const PipelineStepsDisplay = () => {
  const { fieldValue } = usePipelineStepsField();

  return <Status color={fieldValue.color} text={fieldValue.label} />;
};
