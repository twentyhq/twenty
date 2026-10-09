import { useLingui } from '@lingui/react/macro';
import React, { useMemo } from 'react';

import { type FieldEmailsValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { OverflowingList } from 'twenty-ui/components/layout';
import { styled } from '@linaria/react';
import { isDefined } from 'twenty-shared/utils';
import { RoundedLink } from '@/ui/navigation/link/components/RoundedLink/RoundedLink';

type EmailsDisplayProps = {
  value?: FieldEmailsValue;
  isFocused?: boolean;
  onEmailClick?: (email: string, event: React.MouseEvent<HTMLElement>) => void;
};

const StyledContainer = styled.div`
  align-items: center;
  display: flex;
  gap: 4px;
  justify-content: flex-start;

  max-width: 100%;

  overflow: hidden;

  width: 100%;
`;

export const EmailsDisplay = ({
  value,
  isFocused,
  onEmailClick,
}: EmailsDisplayProps) => {
  const { t } = useLingui();

  const emails = useMemo(
    () =>
      [
        value?.primaryEmail ? value.primaryEmail : null,
        ...(value?.additionalEmails ?? []),
      ].filter(isDefined),
    [value?.primaryEmail, value?.additionalEmails],
  );

  return isFocused ? (
    <OverflowingList overflowLabel={t`Show all items`} showOverflowCount>
      {emails.map((email, index) => (
        <RoundedLink
          key={index}
          label={email}
          href={`mailto:${email}`}
          onClick={(event) => onEmailClick?.(email, event)}
        />
      ))}
    </OverflowingList>
  ) : (
    <StyledContainer>
      {emails.map((email, index) => (
        <RoundedLink
          key={index}
          label={email}
          href={`mailto:${email}`}
          onClick={(event) => onEmailClick?.(email, event)}
        />
      ))}
    </StyledContainer>
  );
};
