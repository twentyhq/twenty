import { URLDisplay } from '@/ui/object/field/meta-types/display/content-display/components/URLDisplay';

import { useURLField } from '../../hooks/useURLField';

export const URLFieldDisplay = () => {
  const { fieldValue } = useURLField();

  return <URLDisplay value={fieldValue} />;
};
