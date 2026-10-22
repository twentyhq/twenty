import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { type Ref } from 'react';
import { isNonEmptyArray } from 'twenty-shared/utils';
import { Button, Input } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme';

import { type RecordSharingInvitationRecipient } from '@/object-record/record-sharing/types/RecordSharingInvitationRecipient';
import { RecordShareAccessLevel } from '~/generated-metadata/graphql';

const StyledHeader = styled.div`
  align-items: center;
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  box-sizing: border-box;
  display: flex;
  flex-shrink: 0;
  gap: ${themeCssVariables.spacing[1]};
  height: ${themeCssVariables.spacing[10]};
  padding: 0 ${themeCssVariables.spacing[3]};
`;

const StyledSearch = styled.div`
  flex: 1;
  min-width: 0;
`;

const StyledError = styled.div`
  color: ${themeCssVariables.color.red};
  font-size: ${themeCssVariables.font.size.sm};
  padding: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[3]};
`;

type RecordSharingInvitationProps = {
  searchInputRef?: Ref<HTMLInputElement>;
  search: string;
  selectedRecipients: RecordSharingInvitationRecipient[];
  accessLevel: RecordShareAccessLevel;
  canInvite: boolean;
  isSubmitting?: boolean;
  errorMessage?: string;
  onSearchChange: (search: string) => void;
  onInvite: () => void;
};

export const RecordSharingInvitation = ({
  searchInputRef,
  search,
  selectedRecipients,
  accessLevel,
  canInvite,
  isSubmitting = false,
  errorMessage,
  onSearchChange,
  onInvite,
}: RecordSharingInvitationProps) => {
  const { t } = useLingui();
  const isDisabled = !canInvite || isSubmitting;
  const hasSelection = isNonEmptyArray(selectedRecipients);
  const hasEveryoneRecipient = selectedRecipients.some(
    (recipient) => recipient.kind === 'everyone',
  );
  const hasInvalidAccessLevel =
    accessLevel === RecordShareAccessLevel.NONE ||
    (hasEveryoneRecipient && accessLevel === RecordShareAccessLevel.FULL);
  const selectedRecipientCount = selectedRecipients.length;

  return (
    <div aria-busy={isSubmitting}>
      <StyledHeader>
        <StyledSearch>
          <Input
            ref={searchInputRef}
            role="searchbox"
            aria-label={t`Add people or everyone`}
            placeholder={t`Add people or everyone`}
            value={search}
            variant="inline"
            disabled={isDisabled}
            onValueChange={onSearchChange}
          />
        </StyledSearch>
        <Button
          size="sm"
          variant="solid"
          color="accent"
          disabled={isDisabled || !hasSelection || hasInvalidAccessLevel}
          loading={isSubmitting}
          onClick={onInvite}
        >
          {hasSelection ? t`Invite ${selectedRecipientCount}` : t`Invite`}
        </Button>
      </StyledHeader>
      {hasInvalidAccessLevel && hasSelection && (
        <StyledError role="alert">
          {t`Choose an access level available to all selected recipients.`}
        </StyledError>
      )}
      {isNonEmptyString(errorMessage) && (
        <StyledError role="alert">{errorMessage}</StyledError>
      )}
    </div>
  );
};
