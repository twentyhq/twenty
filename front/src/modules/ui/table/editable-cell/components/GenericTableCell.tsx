import { GenericFieldDisplay } from '@/ui/field/components/GenericFieldDisplay';
import { GenericFieldInput } from '@/ui/field/components/GenericFieldInput';

import { EditableCell } from './EditableCell';

export const GenericTableCell = () => {
  return (
    <EditableCell
      editModeContent={<GenericFieldInput />}
      nonEditModeContent={<GenericFieldDisplay />}
    ></EditableCell>
  );
};
