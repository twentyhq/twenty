import { type ConditionalAvailabilityReadOnlyReason } from '@/conditional-availability/types/ConditionalAvailabilityReadOnlyReason';
import { useLingui } from '@lingui/react/macro';
import { assertUnreachable } from 'twenty-shared/utils';
import { Field } from 'twenty-ui/primitives/input';

type ConditionalAvailabilityReadOnlyNoteProps = {
  reason: ConditionalAvailabilityReadOnlyReason;
};

export const ConditionalAvailabilityReadOnlyNote = ({
  reason,
}: ConditionalAvailabilityReadOnlyNoteProps) => {
  const { t } = useLingui();

  switch (reason) {
    case 'roles':
      return (
        <Field.Description>
          {t`This rule names roles you cannot see, so it is shown read only here. A member with the Roles permission can edit it.`}
        </Field.Description>
      );
    case 'featureFlags':
      return (
        <Field.Description>
          {t`This rule depends on a feature rollout, so it is shown read only here.`}
        </Field.Description>
      );
    default:
      return assertUnreachable(reason);
  }
};
