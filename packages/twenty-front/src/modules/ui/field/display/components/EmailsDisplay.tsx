import { useMemo } from 'react';

import { FieldEmailsValue } from '@/object-record/record-field/types/FieldMetadata';
import { ExpandableList } from '@/ui/layout/expandable-list/components/ExpandableList';
import { styled } from '@linaria/react';
import { isDefined } from 'twenty-shared/utils';
import { RoundedLink } from 'twenty-ui/navigation';
import { THEME_COMMON } from 'twenty-ui/theme';

type EmailsDisplayProps = {
  value?: FieldEmailsValue;
  isFocused?: boolean;
};

const themeSpacing = THEME_COMMON.spacingMultiplicator;

const StyledContainer = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeSpacing * 1}px;
  justify-content: flex-start;

  max-width: 100%;

  overflow: hidden;

  width: 100%;
`;

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
    <StyledContainer>
      {emails.map((email, index) => (
        <RoundedLink key={index} label={email} href={`mailto:${email}`} />
      ))}
    </StyledContainer>
  );
};
