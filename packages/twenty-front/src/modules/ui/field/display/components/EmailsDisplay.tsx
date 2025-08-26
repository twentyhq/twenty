import { useMemo } from 'react';

import { type FieldEmailsValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { ExpandableList } from '@/ui/layout/expandable-list/components/ExpandableList';
import { isDefined } from 'twenty-shared/utils';
import { BaseEmailsDisplay } from 'twenty-ui/fields';
import { RoundedLink } from 'twenty-ui/navigation';

type EmailsDisplayProps = {
  value?: FieldEmailsValue;
  isFocused?: boolean;
};

export const EmailsDisplay = ({ value, isFocused }: EmailsDisplayProps) => {
  const emails = useMemo(
    () =>
      [
        value?.primaryEmail ? value.primaryEmail : null,
        ...(value?.additionalEmails ?? []),
      ].filter(isDefined),
    [value?.primaryEmail, value?.additionalEmails],
  );

  return isFocused ? (
    <ExpandableList isChipCountDisplayed>
      {emails.map((email, index) => (
        <RoundedLink key={index} label={email} href={`mailto:${email}`} />
      ))}
    </ExpandableList>
  ) : (
    <BaseEmailsDisplay>
      {emails.map((email, index) => (
        <RoundedLink key={index} label={email} href={`mailto:${email}`} />
      ))}
    </BaseEmailsDisplay>
  );
};
