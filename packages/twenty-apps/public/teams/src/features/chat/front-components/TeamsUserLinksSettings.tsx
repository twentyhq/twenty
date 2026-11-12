import styled from '@emotion/styled';
import { useState } from 'react';
import { useTranslate } from 'twenty-sdk/front-component';
import { isDefined } from 'twenty-sdk/utils';
import { Callout } from 'twenty-ui/components/feedback';
import { Section } from 'twenty-ui/components/layout';
import { Button } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme';

import { TeamsUserLinkForm } from 'src/features/chat/front-components/TeamsUserLinkForm';
import { TeamsUserLinksList } from 'src/features/chat/front-components/TeamsUserLinksList';
import { UnlinkedTeamsUsersList } from 'src/features/chat/front-components/UnlinkedTeamsUsersList';
import { useCanManageTeamsUserLinks } from 'src/features/chat/front-components/hooks/use-can-manage-teams-user-links';
import { useUnlinkedTeamsUsers } from 'src/features/chat/front-components/hooks/use-unlinked-teams-users';

const StyledContainer = styled.div`
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: ${() => themeCssVariables.spacing[8]};
  width: 100%;
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
    isUnlinkedTeamsUsersLoading,
    unlinkedErrorMessage,
    refetchUnlinkedTeamsUsers,
  } = useUnlinkedTeamsUsers({ isEnabled: canManage });
  const [teamsUserLinksListKey, setTeamsUserLinksListKey] = useState(0);
  const [isManualFormOpen, setIsManualFormOpen] = useState(false);

  const handleLinkSaved = async () => {
    setTeamsUserLinksListKey((version) => version + 1);
    await refetchUnlinkedTeamsUsers();
  };

  const handleManualLinkSaved = async () => {
    setIsManualFormOpen(false);
    await handleLinkSaved();
  };

  return (
    <StyledContainer>
      {!isPermissionLoading && !canManage && (
        <Callout
          status="warning"
          title={t('You need the roles permission')}
          description={t(
            'Only members with the roles permission can create or change Teams user links. You can review the existing links below.',
          )}
        />
      )}
      {canManage && (
        <Section.Root>
          <Section.Header
            title={t('Unlinked Teams users')}
            description={t(
              'Only Teams users linked to a workspace member can use the assistant. Pick a workspace member on a row to link them in place.',
            )}
          />
          {isUnlinkedTeamsUsersLoading && unlinkedTeamsUsers.length === 0 ? (
            <StyledCenteredState>
              {t('Loading unlinked Teams users…')}
            </StyledCenteredState>
          ) : isDefined(unlinkedErrorMessage) ? (
            <StyledCenteredState>{unlinkedErrorMessage}</StyledCenteredState>
          ) : (
            <UnlinkedTeamsUsersList
              unlinkedTeamsUsers={unlinkedTeamsUsers}
              hasMore={hasMoreUnlinkedTeamsUsers}
              onLinkSaved={handleLinkSaved}
            />
          )}
        </Section.Root>
      )}
      <TeamsUserLinksList key={teamsUserLinksListKey} />
      {canManage &&
        (isManualFormOpen ? (
          <TeamsUserLinkForm onLinkSaved={handleManualLinkSaved} />
        ) : (
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
        ))}
    </StyledContainer>
  );
};
