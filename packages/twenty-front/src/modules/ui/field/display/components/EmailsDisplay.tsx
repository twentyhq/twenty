import React, { useMemo } from 'react';

import { type FieldEmailsValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { ExpandableList } from '@/ui/layout/expandable-list/components/ExpandableList';
import { isDefined } from 'twenty-shared/utils';
import { RoundedLink } from 'twenty-ui/navigation';

type EmailsDisplayProps = {
  value?: FieldEmailsValue;
  onEmailClick?: (email: string, event: React.MouseEvent<HTMLElement>) => void;
};

export const EmailsDisplay = ({
  value,
  onEmailClick,
}: EmailsDisplayProps) => {
  const emails = useMemo(
    () =>
      [
        value?.primaryEmail ? value.primaryEmail : null,
        ...(value?.additionalEmails ?? []),
      ].filter(isDefined),
    [value?.primaryEmail, value?.additionalEmails],
  );

  return (
    <ExpandableList>
      {emails.map((email, index) => (
        <RoundedLink
          key={index}
          label={email}
          href={`mailto:${email}`}
          onClick={(event) => onEmailClick?.(email, event)}
        />
      ))}
    </ExpandableList>
  );
};
