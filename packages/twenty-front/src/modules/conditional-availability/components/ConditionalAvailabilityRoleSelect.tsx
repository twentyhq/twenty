import { ConditionalAvailabilityOptionsSelect } from '@/conditional-availability/components/ConditionalAvailabilityOptionsSelect';
import { useConditionalAvailabilityEditorContext } from '@/conditional-availability/contexts/ConditionalAvailabilityEditorContext';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';

type ConditionalAvailabilityRoleSelectProps = {
  dropdownId: string;
  values: string[];
  onChange: (values: string[]) => void;
};

export const ConditionalAvailabilityRoleSelect = ({
  dropdownId,
  values,
  onChange,
}: ConditionalAvailabilityRoleSelectProps) => {
  const { t } = useLingui();
  const { roles, isLoadingRoles, hasRolesPermission } =
    useConditionalAvailabilityEditorContext();

  const options = roles
    .flatMap((role) =>
      role.canBeAssignedToUsers && isDefined(role.universalIdentifier)
        ? [{ value: role.universalIdentifier, label: role.label }]
        : [],
    )
    .sort((firstOption, secondOption) =>
      firstOption.label.localeCompare(secondOption.label),
    );

  const getUnknownValueLabel = (value: string) => {
    if (!hasRolesPermission) {
      return t`Role`;
    }

    const role = roles.find(
      (candidate) => candidate.universalIdentifier === value,
    );

    return isDefined(role) ? role.label : t`Deleted role`;
  };

  return (
    <ConditionalAvailabilityOptionsSelect
      dropdownId={dropdownId}
      options={options}
      values={values}
      getUnknownValueLabel={getUnknownValueLabel}
      isMultiple
      searchPlaceholder={t`Search roles`}
      placeholder={t`Select roles`}
      isLoading={isLoadingRoles}
      onChange={onChange}
    />
  );
};
