import styled from '@emotion/styled';
import { isNonEmptyString } from '@sniptt/guards';
import QRCode from 'react-qr-code';
import { useTranslate } from 'twenty-sdk/front-component';
import { Callout, Section } from 'twenty-ui/components';
import { Button } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme';

import { TimeoutEffect } from 'src/front-components/components/TimeoutEffect';
import { useStartTelegramUserLink } from 'src/front-components/hooks/use-start-telegram-user-link';
import { TELEGRAM_LINK_TOKEN_TTL_MS } from 'src/logic-functions/constants/telegram-link-token-ttl-ms';

const StyledActions = styled.div`
  align-items: flex-start;
  display: flex;
  flex-direction: column;
  font-family: ${() => themeCssVariables.font.family};
  gap: ${() => themeCssVariables.spacing[3]};
`;

const StyledLink = styled.a`
  color: ${() => themeCssVariables.color.blue};
  font-size: ${() => themeCssVariables.font.size.md};
  font-weight: ${() => themeCssVariables.font.weight.medium};
`;

const StyledHint = styled.p`
  color: ${() => themeCssVariables.font.color.tertiary};
  font-size: ${() => themeCssVariables.font.size.sm};
  margin: 0;
`;

const StyledCommand = styled.code`
  background: ${() => themeCssVariables.background.tertiary};
  border-radius: ${() => themeCssVariables.border.radius.sm};
  color: ${() => themeCssVariables.font.color.primary};
  font-size: ${() => themeCssVariables.font.size.sm};
  max-width: 100%;
  overflow-wrap: anywhere;
  padding: ${() => themeCssVariables.spacing[1]}
    ${() => themeCssVariables.spacing[2]};
  user-select: all;
`;

const QR_CODE_SIZE_PX = 144;
const QR_CODE_BACKGROUND_COLOR = '#FFFFFF';

const StyledQrCode = styled.div`
  background: ${QR_CODE_BACKGROUND_COLOR};
  border: 1px solid ${() => themeCssVariables.border.color.medium};
  border-radius: ${() => themeCssVariables.border.radius.md};
  display: flex;
  padding: ${() => themeCssVariables.spacing[3]};
`;

export const TelegramConnectSection = () => {
  const { t } = useTranslate();
  const { startState, startTelegramUserLink, expireTelegramUserLink } =
    useStartTelegramUserLink();

  return (
    <Section.Root>
      <Section.Header
        title={t('Your Telegram account')}
        description={t(
          'Connect your own Telegram account so the Twenty bot knows who you are when you message it.',
        )}
      />
      <StyledActions>
        {startState.status === 'FAILED' && (
          <Callout
            status="error"
            title={t('Could not start the connection')}
            description={
              isNonEmptyString(startState.message)
                ? startState.message
                : t('Please try again.')
            }
          />
        )}
        {startState.status === 'READY' ? (
          <>
            <TimeoutEffect
              delayMilliseconds={TELEGRAM_LINK_TOKEN_TTL_MS}
              onTimeout={expireTelegramUserLink}
            />
            <StyledLink
              href={startState.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              {t('Open Telegram to finish connecting')}
            </StyledLink>
            <StyledHint>
              {t(
                'Press Start in the chat that opens. The link works once and expires in 10 minutes.',
              )}
            </StyledHint>
            <StyledHint>
              {t(
                'No Telegram on this computer? Scan this code with your phone:',
              )}
            </StyledHint>
            <StyledQrCode>
              <QRCode
                value={startState.url}
                size={QR_CODE_SIZE_PX}
                title={t('QR code that opens the Telegram bot')}
              />
            </StyledQrCode>
            <StyledHint>
              {t('Or send this message to @{botUsername}:', {
                botUsername: startState.botUsername,
              })}
            </StyledHint>
            <StyledCommand>{startState.startCommand}</StyledCommand>
          </>
        ) : (
          <>
            {startState.status === 'EXPIRED' && (
              <StyledHint>
                {t('This link has expired. Start a new connection.')}
              </StyledHint>
            )}
            <Button
              type="button"
              variant="outline"
              loading={startState.status === 'STARTING'}
              disabled={startState.status === 'STARTING'}
              onClick={startTelegramUserLink}
            >
              {t('Connect Telegram')}
            </Button>
          </>
        )}
      </StyledActions>
    </Section.Root>
  );
};
