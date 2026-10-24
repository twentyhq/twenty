import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useRef } from 'react';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { IconLink } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import { Separator } from 'twenty-ui/primitives/layout';
import { themeCssVariables } from 'twenty-ui/theme';

import { RecordSharingInvitation } from '@/object-record/record-sharing/components/RecordSharingInvitation';
import { RecordSharingInvitationAccessPicker } from '@/object-record/record-sharing/components/RecordSharingInvitationAccessPicker';
import { RecordSharingInvitationRecipientPicker } from '@/object-record/record-sharing/components/RecordSharingInvitationRecipientPicker';
import { type useRecordSharing } from '@/object-record/record-sharing/hooks/useRecordSharing';
import { type RecordSharingInvitationRecipient } from '@/object-record/record-sharing/types/RecordSharingInvitationRecipient';
import { getRecordSharingRecipientGroups } from '@/object-record/record-sharing/utils/getRecordSharingRecipientGroups';
import { SidePanelShareRecordGeneralAccessItem } from '@/side-panel/pages/share-record/components/SidePanelShareRecordGeneralAccessItem';
import { SidePanelShareRecordGroup } from '@/side-panel/pages/share-record/components/SidePanelShareRecordGroup';
import { SidePanelShareRecordList } from '@/side-panel/pages/share-record/components/SidePanelShareRecordList';
import { SidePanelShareRecordRecipient } from '@/side-panel/pages/share-record/components/SidePanelShareRecordRecipient';
import { SidePanelShareRecordRetryItem } from '@/side-panel/pages/share-record/components/SidePanelShareRecordRetryItem';
import { SidePanelShareRecordSkeleton } from '@/side-panel/pages/share-record/components/SidePanelShareRecordSkeleton';
import { useSidePanelShareRecordInvitation } from '@/side-panel/pages/share-record/hooks/useSidePanelShareRecordInvitation';
import { useSidePanelShareRecordSearch } from '@/side-panel/pages/share-record/hooks/useSidePanelShareRecordSearch';
import { SidePanelFooter } from '@/ui/layout/side-panel/components/SidePanelFooter';
import {
  ObjectSharingReach,
  RecordSharingMode,
} from '~/generated-metadata/graphql';
import { useCopyToClipboard } from '~/hooks/useCopyToClipboard';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const StyledListContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
`;

const StyledDescription = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.sm};
  line-height: 1.5;
  padding: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[1]};
  white-space: normal;
`;

const StyledSeparator = styled.div`
  padding: ${themeCssVariables.spacing[0.5]} 0;
`;

type SidePanelShareRecordContentProps = {
  recordUrl: string;
  objectLabelPlural: string;
  sharingReach: ObjectSharingReach;
  sharingState: ReturnType<typeof useRecordSharing>;
};

export const SidePanelShareRecordContent = ({
  recordUrl,
  objectLabelPlural,
  sharingReach,
  sharingState,
}: SidePanelShareRecordContentProps) => {
  const { t } = useLingui();
  const {
    sharing,
    loading,
    error,
    saving,
    setGeneralAccess,
    setShare,
    removeShare,
    refetch,
  } = sharingState;
  const invitation = useSidePanelShareRecordInvitation({
    sharing,
    saving,
    setShare,
    setGeneralAccess,
    objectLabelPlural,
  });
  const searchInputRef = useRef<HTMLInputElement>(null);
  const {
    search,
    onSearchChange,
    matchingShares,
    matchingRecipients,
    matchesGeneralAccess,
    hasSelection,
    isInviting,
  } = useSidePanelShareRecordSearch({
    sharing,
    recipients: invitation.recipients,
    selectedRecipients: invitation.selectedRecipients,
    generalAccess: invitation.generalAccess,
  });
  const { copyToClipboard } = useCopyToClipboard();
  const canManageSharing = sharing?.canManageSharing ?? false;
  const isInitialLoading = loading && !isDefined(sharing) && !isDefined(error);
  const recipientGroups = getRecordSharingRecipientGroups({
    isInviting,
    matchingShares,
  });
  const handleRecipientsChange = (
    recipients: RecordSharingInvitationRecipient[],
  ) => {
    invitation.onRecipientsChange(recipients);
    searchInputRef.current?.focus();
  };
  const handleInvite = async () => {
    const hasInvitedAllRecipients = await invitation.onInvite();

    if (!hasInvitedAllRecipients) {
      return;
    }

    onSearchChange('');
  };
  const accessPicker = (
    <RecordSharingInvitationAccessPicker
      value={invitation.accessLevel}
      hasEveryoneRecipient={invitation.hasEveryoneRecipient}
      disabled={invitation.isSubmitting}
      onChange={invitation.onAccessLevelChange}
    />
  );

  return (
    <StyledContainer>
      {canManageSharing && !isDefined(error) && (
        <RecordSharingInvitation
          searchInputRef={searchInputRef}
          search={search}
          onSearchChange={onSearchChange}
          selectedRecipients={invitation.selectedRecipients}
          hasInvalidAccessLevel={invitation.hasInvalidAccessLevel}
          canInvite={invitation.canInvite}
          isSubmitting={invitation.isSubmitting}
          onInvite={() => void handleInvite()}
        />
      )}
      <StyledListContainer>
        {isInitialLoading && <SidePanelShareRecordSkeleton />}
        {!isInitialLoading && (
          <SidePanelShareRecordList>
            {isDefined(error) ? (
              <>
                <StyledDescription role="alert">{t`Sharing settings could not be loaded.`}</StyledDescription>
                <SidePanelShareRecordRetryItem refetch={refetch} />
              </>
            ) : (
              isDefined(sharing) &&
              (canManageSharing ? (
                <>
                  {hasSelection && (
                    <SidePanelShareRecordGroup heading={t`Selected`}>
                      {accessPicker}
                      <RecordSharingInvitationRecipientPicker
                        recipients={invitation.selectedRecipients}
                        selectedRecipients={invitation.selectedRecipients}
                        disabled={invitation.isSubmitting}
                        onRecipientsChange={handleRecipientsChange}
                      />
                    </SidePanelShareRecordGroup>
                  )}
                  {(!isInviting || matchesGeneralAccess) && (
                    <SidePanelShareRecordGroup
                      heading={isInviting ? t`Have access` : t`Everyone`}
                    >
                      <SidePanelShareRecordGeneralAccessItem
                        generalAccessLevel={sharing.generalAccessLevel}
                        defaultGeneralAccessLevel={
                          sharing.defaultGeneralAccessLevel
                        }
                        hasManagedGeneralAccess={
                          sharing.hasManagedGeneralAccess
                        }
                        objectLabelPlural={objectLabelPlural}
                        isSaving={invitation.isSubmitting}
                        setGeneralAccess={setGeneralAccess}
                      />
                    </SidePanelShareRecordGroup>
                  )}
                  {recipientGroups.map(({ heading, matchingShares }) =>
                    isNonEmptyArray(matchingShares) ? (
                      <SidePanelShareRecordGroup
                        key={heading.id}
                        heading={t(heading)}
                        shouldHideHeading={isInviting && matchesGeneralAccess}
                      >
                        {matchingShares.map(({ share, label, member }) => (
                          <SidePanelShareRecordRecipient
                            key={share.id}
                            share={share}
                            label={label}
                            member={member}
                            roles={sharing.roles}
                            objectLabelPlural={objectLabelPlural}
                            sharingReach={sharingReach}
                            isSaving={invitation.isSubmitting}
                            setShare={setShare}
                            removeShare={removeShare}
                          />
                        ))}
                      </SidePanelShareRecordGroup>
                    ) : null,
                  )}
                  {isInviting && (
                    <SidePanelShareRecordGroup heading={t`Not shared with`}>
                      {!hasSelection && (
                        <>
                          {accessPicker}
                          <StyledSeparator>
                            <Separator />
                          </StyledSeparator>
                        </>
                      )}
                      <RecordSharingInvitationRecipientPicker
                        recipients={matchingRecipients}
                        selectedRecipients={invitation.selectedRecipients}
                        disabled={invitation.isSubmitting}
                        onRecipientsChange={handleRecipientsChange}
                      />
                      {!isNonEmptyArray(matchingRecipients) && (
                        <StyledDescription>{t`No matching people or roles`}</StyledDescription>
                      )}
                    </SidePanelShareRecordGroup>
                  )}
                  {sharing.hasManagedGeneralAccess && (
                    <StyledDescription>{t`Workspace access is also managed by an application.`}</StyledDescription>
                  )}
                  {sharing.sharingMode === RecordSharingMode.INHERITED && (
                    <StyledDescription>{t`Access is also inherited from related records.`}</StyledDescription>
                  )}
                  {!sharing.hasManagedGeneralAccess &&
                    sharing.sharingMode !== RecordSharingMode.INHERITED && (
                      <StyledDescription>
                        {sharingReach === ObjectSharingReach.WORKSPACE
                          ? t`People you add get this record even if their role can't access ${objectLabelPlural}. Field permissions still apply.`
                          : t`Role and field permissions still apply.`}
                      </StyledDescription>
                    )}
                </>
              ) : (
                <StyledDescription>
                  {sharing.sharingMode === RecordSharingMode.ROLE_ONLY
                    ? t`Access to ${objectLabelPlural} is set by roles, not record by record.`
                    : sharing.sharingMode === RecordSharingMode.OPEN_BY_DEFAULT
                      ? t`Only the creator of this record, people with full access to it and admins can change who has access.`
                      : t`Only the creator of this record and people with full access to it can change who has access.`}
                </StyledDescription>
              ))
            )}
          </SidePanelShareRecordList>
        )}
      </StyledListContainer>
      <SidePanelFooter
        variant="compact"
        actions={[
          <Button
            key="copy-link"
            size="sm"
            variant="outline"
            startIcon={<IconLink />}
            onClick={() => void copyToClipboard(recordUrl)}
          >
            {t`Copy link`}
          </Button>,
        ]}
      />
    </StyledContainer>
  );
};
