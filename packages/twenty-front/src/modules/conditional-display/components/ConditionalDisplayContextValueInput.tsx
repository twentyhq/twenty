import { getConditionalDisplayDeviceLabel } from '@/conditional-display/utils/getConditionalDisplayDeviceLabel';
import { rolesSelector } from '@/metadata-store/states/rolesSelector';
import { FormMultiSelectFieldInput } from '@/object-record/record-field/ui/form-types/components/FormMultiSelectFieldInput';
import { FormSelectFieldInput } from '@/object-record/record-field/ui/form-types/components/FormSelectFieldInput';
import { FormWorkspaceMemberFilterValueInput } from '@/object-record/record-field/ui/form-types/components/FormWorkspaceMemberFilterValueInput';
import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useLingui } from '@lingui/react/macro';
import { CONDITIONAL_DISPLAY_DEVICES } from 'twenty-shared/constants';
import { type ConditionalDisplayContextKey } from 'twenty-shared/types';
import { assertUnreachable, isDefined, parseJson } from 'twenty-shared/utils';
import { useIcons } from 'twenty-ui/icon';
import { type JsonValue } from 'type-fest';

type ConditionalDisplayContextValueInputProps = {
  recordFilter: RecordFilter;
  contextKey: ConditionalDisplayContextKey;
  onChange: (value: JsonValue) => void;
  readonly?: boolean;
};

export const ConditionalDisplayContextValueInput = ({
  recordFilter,
  contextKey,
  onChange,
  readonly,
}: ConditionalDisplayContextValueInputProps) => {
  const { t } = useLingui();
  const { getIcon } = useIcons();

  const roles = useAtomStateValue(rolesSelector);

  switch (contextKey) {
    case 'currentRoleId':
      return (
        <FormMultiSelectFieldInput
          label=""
          defaultValue={recordFilter.value}
          onChange={onChange}
          placeholder={t`Select roles`}
          readonly={readonly}
          options={roles.map((role) => ({
            label: role.label,
            value: role.id,
            Icon: isDefined(role.icon) ? getIcon(role.icon) : undefined,
          }))}
        />
      );
    case 'currentWorkspaceMemberId':
      return (
        <FormWorkspaceMemberFilterValueInput
          label=""
          defaultValue={recordFilter.value}
          onChange={onChange}
          readonly={readonly}
        />
      );
    case 'device':
      return (
        <FormSelectFieldInput
          label=""
          defaultValue={parseJson<string[]>(recordFilter.value)?.[0]}
          onChange={(device) => onChange(isDefined(device) ? [device] : '')}
          placeholder={t`Select device`}
          readonly={readonly}
          options={CONDITIONAL_DISPLAY_DEVICES.map((device) => ({
            label: getConditionalDisplayDeviceLabel(device),
            value: device,
          }))}
        />
      );
    default:
      return assertUnreachable(contextKey);
  }
};
