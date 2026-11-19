import { ConditionalAvailabilityDeviceSelect } from '@/conditional-availability/components/ConditionalAvailabilityDeviceSelect';
import { ConditionalAvailabilityRoleSelect } from '@/conditional-availability/components/ConditionalAvailabilityRoleSelect';
import { ConditionalAvailabilityWorkspaceMemberSelect } from '@/conditional-availability/components/ConditionalAvailabilityWorkspaceMemberSelect';
import { useConditionalAvailabilityEditorContext } from '@/conditional-availability/hooks/useConditionalAvailabilityEditorContext';
import { type ConditionalAvailabilityRow } from '@/conditional-availability/types/ConditionalAvailabilityRow';
import { getConditionalAvailabilityValueArity } from '@/conditional-availability/utils/getConditionalAvailabilityValueArity';
import { assertUnreachable } from 'twenty-shared/utils';

type ConditionalAvailabilityValueInputProps = {
  row: ConditionalAvailabilityRow;
};

export const ConditionalAvailabilityValueInput = ({
  row,
}: ConditionalAvailabilityValueInputProps) => {
  const { itemKey, changeRowValues } =
    useConditionalAvailabilityEditorContext();

  const dropdownId = `conditional-availability-value-${itemKey}-${row.id}`;
  const isMultiple = getConditionalAvailabilityValueArity({ row }) === 'list';

  const handleChange = (values: string[]) => {
    changeRowValues(row.id, values);
  };

  switch (row.subject) {
    case 'role':
      return (
        <ConditionalAvailabilityRoleSelect
          dropdownId={dropdownId}
          values={row.values}
          onChange={handleChange}
        />
      );
    case 'workspaceMember':
      return (
        <ConditionalAvailabilityWorkspaceMemberSelect
          dropdownId={dropdownId}
          values={row.values}
          isMultiple={isMultiple}
          onChange={handleChange}
        />
      );
    case 'device':
      return (
        <ConditionalAvailabilityDeviceSelect
          dropdownId={dropdownId}
          values={row.values}
          onChange={handleChange}
        />
      );
    case 'recordField':
      return null;
    default:
      return assertUnreachable(row);
  }
};
