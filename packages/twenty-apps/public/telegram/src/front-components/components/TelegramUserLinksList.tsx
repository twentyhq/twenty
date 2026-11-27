import styled from '@emotion/styled';
import { isNonEmptyString } from '@sniptt/guards';
import { enqueueSnackbar, useTranslate } from 'twenty-sdk/front-component';
import { isDefined } from 'twenty-sdk/utils';
import { Section } from 'twenty-ui/components';
import { Button } from 'twenty-ui/primitives/input';
import { OverflowingTextWithTooltip } from 'twenty-ui/primitives/typography';
import { themeCssVariables } from 'twenty-ui/theme';

import { useRemoveTelegramUserLink } from 'src/front-components/hooks/use-remove-telegram-user-link';
import { useTelegramUserLinks } from 'src/front-components/hooks/use-telegram-user-links';
import { type TelegramUserLinkRecord } from 'src/front-components/types/telegram-user-link-record.type';

const StyledList = styled.ul`
  border: 1px solid ${() => themeCssVariables.border.color.medium};
  border-radius: ${() => themeCssVariables.border.radius.md};
  color: ${() => themeCssVariables.font.color.primary};
  font-family: ${() => themeCssVariables.font.family};
  list-style: none;
  margin: 0;
  padding: 0;
`;

const StyledRow = styled.li`
  align-items: center;
  display: grid;
  font-size: ${() => themeCssVariables.font.size.md};
  gap: ${() => themeCssVariables.spacing[4]};
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1fr) auto;
  min-height: ${() => themeCssVariables.spacing[8]};
  padding: ${() => themeCssVariables.spacing[2]}
    ${() => themeCssVariables.spacing[4]};

  & + & {
    border-top: 1px solid ${() => themeCssVariables.border.color.medium};
  }
`;

const StyledSecondaryText = styled.span`
  color: ${() => themeCssVariables.font.color.secondary};
  font-family: ${() => themeCssVariables.font.family};
`;

const TelegramUserLinksContent = () => {
  const { t } = useTranslate();
  const {
    telegramUserLinks,
    isLoading,
    hasLoadError,
    canRemove,
    dropTelegramUserLink,
  } = useTelegramUserLinks();
  const { removeTelegramUserLink, removingLinkId } =
    useRemoveTelegramUserLink();

  const handleRemove = async (telegramUserLink: TelegramUserLinkRecord) => {
    const isRemoved = await removeTelegramUserLink(telegramUserLink.id);

    if (!isRemoved) {
      enqueueSnackbar({
        message: t('Could not disconnect the account. Please try again.'),
        variant: 'error',
      });

      return;
    }

    dropTelegramUserLink(telegramUserLink.id);
    enqueueSnackbar({ message: t('Account disconnected'), variant: 'success' });
  };

  if (isLoading) {
    return <StyledSecondaryText>{t('Loading…')}</StyledSecondaryText>;
  }

  if (hasLoadError) {
    return (
      <p role="alert">
        {t('Could not load connected Telegram accounts. Please try again.')}
      </p>
    );
  }

  if (telegramUserLinks.length === 0) {
    return (
      <StyledSecondaryText>
        {t('No Telegram account is connected yet.')}
      </StyledSecondaryText>
    );
  }

  return (
    <StyledList>
      {telegramUserLinks.map((telegramUserLink) => {
        const accountName = isNonEmptyString(telegramUserLink.name)
          ? telegramUserLink.name
          : t('Unnamed Telegram account');

        return (
          <StyledRow key={telegramUserLink.id}>
            <OverflowingTextWithTooltip text={accountName} />
            <StyledSecondaryText>
              {isNonEmptyString(telegramUserLink.telegramUsername)
                ? `@${telegramUserLink.telegramUsername}`
                : ''}
            </StyledSecondaryText>
            <OverflowingTextWithTooltip
              text={
                isNonEmptyString(telegramUserLink.workspaceMemberName)
                  ? telegramUserLink.workspaceMemberName
                  : t('No workspace member')
              }
            />
            <span>
              {canRemove(telegramUserLink) && (
                <Button
                  variant="ghost"
                  color="danger"
                  size="sm"
                  aria-label={t('Disconnect {name}', { name: accountName })}
                  loading={removingLinkId === telegramUserLink.id}
                  disabled={isDefined(removingLinkId)}
                  onClick={() => handleRemove(telegramUserLink)}
                >
                  {t('Disconnect')}
                </Button>
              )}
            </span>
          </StyledRow>
        );
      })}
    </StyledList>
  );
};

export const TelegramUserLinksList = () => {
  const { t } = useTranslate();

  return (
    <Section.Root>
      <Section.Header
        title={t('Connected Telegram accounts')}
        description={t(
          'Accounts connected in this workspace. Members can disconnect their own account, and members with the roles permission can disconnect any account.',
        )}
      />
      <TelegramUserLinksContent />
    </Section.Root>
  );
};
