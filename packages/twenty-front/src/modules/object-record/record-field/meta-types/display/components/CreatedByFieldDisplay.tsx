import { useCreatedByDisplay } from '@/object-record/record-field/meta-types/hooks/useCreatedByFieldDisplay';
import { CreatedByDisplay } from '@/ui/field/display/components/CreatedByDisplay';
import { isNonEmptyString } from '@sniptt/guards';

export const CreatedByFieldDisplay = () => {
  const { fieldValue } = useCreatedByDisplay();

  const name = !fieldValue.workspaceMemberId
    ? fieldValue.name
    : [
        fieldValue.workspaceMember?.name.firstName,
        fieldValue.workspaceMember?.name.lastName,
      ]
        .filter(isNonEmptyString)
        .join(' ');

  return (
    <CreatedByDisplay
      name={name}
      source={fieldValue.source}
      avatarUrl={fieldValue.workspaceMember?.avatarUrl}
      workspaceMemberId={fieldValue.workspaceMemberId}
    />
  );
};
