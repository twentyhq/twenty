import React, { useMemo } from 'react';

import { type FieldEmailsValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { ExpandableList } from '@/ui/layout/expandable-list/components/ExpandableList';
import { styled } from '@linaria/react';
import { FieldClickAction } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { RoundedLink } from 'twenty-ui/navigation';
import { THEME_COMMON } from 'twenty-ui/theme';

type EmailsDisplayProps = {
  value?: FieldEmailsValue;
  isFocused?: boolean;
  onEmailClick?: (email: string, event: React.MouseEvent<HTMLElement>) => void;
  clickAction?: FieldClickAction;
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

export const EmailsDisplay = ({
  value,
  isFocused,
  onEmailClick,
  clickAction,
}: EmailsDisplayProps) => {
  const emails = useMemo(
    () =>
      [
        value?.primaryEmail ? value.primaryEmail : null,
        ...(value?.additionalEmails ?? []),
      ].filter(isDefined),
    [value?.primaryEmail, value?.additionalEmails],
  );

  const handleClick = (email: string, event: React.MouseEvent<HTMLElement>) => {
    if (clickAction === FieldClickAction.COPY) {
      onEmailClick?.(email, event);
    }
  };

  return isFocused ? (
    <ExpandableList isChipCountDisplayed>
      {emails.map((email, index) => (
        <RoundedLink
          key={index}
          label={email}
          href={`mailto:${email}`}
          onClick={(event) => handleClick(email, event)}
        />
      ))}
    </ExpandableList>
  ) : (
    <StyledContainer>
      {emails.map((email, index) => (
        <RoundedLink
          key={index}
          label={email}
          href={`mailto:${email}`}
          onClick={(event) => handleClick(email, event)}
        />
      ))}
    </StyledContainer>
  );
};
