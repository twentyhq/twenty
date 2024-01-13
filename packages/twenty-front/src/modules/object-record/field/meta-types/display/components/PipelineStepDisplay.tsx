import { Status } from '@/ui/display/status/components/Status';

import { usePipelineStepField } from '../../hooks/usePipelineStepField';

export const PipelineStepDisplay = () => {
  const { fieldValue, fieldDefinition } = usePipelineStepField();

  const selectedOption = fieldDefinition.metadata.options.find(
    (option) => option.value === fieldValue,
  );

  return selectedOption ? ( 
   <Status color={selectedOption.color} text={selectedOption.label} />
  ) : (
    <></>
  );
};
