import styled from '@emotion/styled';
import { isNonEmptyString } from '@sniptt/guards';
import { useState } from 'react';
import { enqueueSnackbar, useTranslate } from 'twenty-sdk/front-component';
import { isDefined } from 'twenty-sdk/utils';
import { Callout, Section } from 'twenty-ui/components';
import { Button } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme';

import { TeamsUserLinkForm } from 'src/features/chat/front-components/TeamsUserLinkForm';
import { TeamsUserLinksList } from 'src/features/chat/front-components/TeamsUserLinksList';
import { UnlinkedTeamsUsersList } from 'src/features/chat/front-components/UnlinkedTeamsUsersList';
import { useCanManageTeamsUserLinks } from 'src/features/chat/front-components/hooks/use-can-manage-teams-user-links';
import { useMatchTeamsUserLinks } from 'src/features/chat/front-components/hooks/use-match-teams-user-links';
import { useUnlinkedTeamsUsers } from 'src/features/chat/front-components/hooks/use-unlinked-teams-users';

const StyledContainer = styled.div`
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: ${() => themeCssVariables.spacing[8]};
  width: 100%;
`;

const StyledMatchAction = styled.div`
  align-items: center;
  display: flex;
  gap: ${() => themeCssVariables.spacing[3]};
  justify-content: flex-end;
  padding-top: ${() => themeCssVariables.spacing[2]};
`;

const StyledMatchSummary = styled.span`
  color: ${() => themeCssVariables.font.color.secondary};
  font-family: ${() => themeCssVariables.font.family};
  font-size: ${() => themeCssVariables.font.size.xs};
`;

const StyledDisclosure = styled.div`
  align-self: flex-start;
`;

const StyledCenteredState = styled.div`
  box-sizing: border-box;
  color: ${() => themeCssVariables.font.color.tertiary};
  font-family: ${() => themeCssVariables.font.family};
  font-size: ${() => themeCssVariables.font.size.sm};
  padding: ${() => themeCssVariables.spacing[4]};
`;

export const TeamsUserLinksSettings = () => {
  const { t } = useTranslate();
  const { canManage, isPermissionLoading } = useCanManageTeamsUserLinks();
  const {
    unlinkedTeamsUsers,
    hasMoreUnlinkedTeamsUsers,
    hasAutoMatchFailed,
    isUnlinkedTeamsUsersLoading,
    unlinkedErrorMessage,
    refetchUnlinkedTeamsUsers,
  } = useUnlinkedTeamsUsers({ isEnabled: canManage });
  const { matchTeamsUserLinks, isMatching } = useMatchTeamsUserLinks();
  const [teamsUserLinksListKey, setTeamsUserLinksListKey] = useState(0);
  const [isManualFormOpen, setIsManualFormOpen] = useState(false);
  const [matchSummary, setMatchSummary] = useState<string | undefined>(
    undefined,
  );
  const [hasLastMatchRunFailed, setHasLastMatchRunFailed] = useState<
    boolean | undefined
  >(undefined);

  const handleLinkSaved = async () => {
    setTeamsUserLinksListKey((version) => version + 1);
    await refetchUnlinkedTeamsUsers();
  };

  const handleManualLinkSaved = async () => {
    setIsManualFormOpen(false);
    await handleLinkSaved();
  };

  const handleMatchByEmail = async () => {
    const result = await matchTeamsUserLinks();

    if (!result.success) {
      setMatchSummary(undefined);
      setHasLastMatchRunFailed(true);
      enqueueSnackbar({
        message: isNonEmptyString(result.error) ? result.error : result.message,
        variant: 'error',
      });

      return;
    }

    setMatchSummary(result.message);
    setHasLastMatchRunFailed(result.failedCount > 0);
    await handleLinkSaved();
  };

  const renderUnlinkedTeamsUsers = () => {
    if (isUnlinkedTeamsUsersLoading && unlinkedTeamsUsers.length === 0) {
      return (
        <StyledCenteredState>
          {t('Loading unlinked Teams users…')}
        </StyledCenteredState>
      );
    }

    if (isDefined(unlinkedErrorMessage)) {
      return <StyledCenteredState>{unlinkedErrorMessage}</StyledCenteredState>;
    }

    return (
      <UnlinkedTeamsUsersList
        unlinkedTeamsUsers={unlinkedTeamsUsers}
        hasMore={hasMoreUnlinkedTeamsUsers}
        onLinkSaved={handleLinkSaved}
      />
    );
  };

  const renderManualLinkControl = () => {
    if (isManualFormOpen) {
      return <TeamsUserLinkForm onLinkSaved={handleManualLinkSaved} />;
    }

    return (
      <StyledDisclosure>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => setIsManualFormOpen(true)}
        >
          {t('Link someone not listed above')}
        </Button>
      </StyledDisclosure>
    );
  };

  const shouldWarnAboutAutoMatch =
    canManage && (hasLastMatchRunFailed ?? hasAutoMatchFailed);

  return (
    <StyledContainer>
      {!isPermissionLoading && !canManage && (
        <Callout
          variant="warning"
          title={t('You need the roles permission')}
          description={t(
            'Only members with the roles permission can create or change Teams user links. You can review the existing links below.',
          )}
        />
      )}
      {shouldWarnAboutAutoMatch && (
        <Callout
          variant="warning"
          title={t('Email auto-link did not finish')}
          description={t(
            'The last automatic email match failed before linking everyone. Press Auto-link by email below to run it again.',
          )}
        />
      )}
      {canManage && (
        <Section.Root>
          <Section.Header
            title={t('Unlinked Teams users')}
            description={t(
              'Only Teams users linked to a workspace member can use the assistant. Pick a workspace member on a row to link them in place, or auto-link everyone whose directory email matches a workspace member.',
            )}
          />
          {renderUnlinkedTeamsUsers()}
          <StyledMatchAction>
            {isDefined(matchSummary) && (
              <StyledMatchSummary>{matchSummary}</StyledMatchSummary>
            )}
            <Button
              type="button"
              size="sm"
              variant="outline"
              loading={isMatching}
              onClick={handleMatchByEmail}
            >
              {t('Auto-link by email')}
            </Button>
          </StyledMatchAction>
        </Section.Root>
      )}
      <TeamsUserLinksList key={teamsUserLinksListKey} />
      {canManage && renderManualLinkControl()}
    </StyledContainer>
  );
};
