import styled from '@emotion/styled';
import { t } from 'twenty-sdk/front-component';
import { getPublicAssetUrl } from 'twenty-sdk/utils';
import { InlineBanner } from 'twenty-ui/components/feedback';
import { Avatar } from 'twenty-ui/primitives/data-display';
import { Field, Input, InputGroup } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${() => themeCssVariables.spacing[2]};
`;

type WhatsappAccountFieldProps = {
  name: string;
  handle: string;
  isAuthFailed: boolean;
};

export const WhatsappAccountField = ({
  name,
  handle,
  isAuthFailed,
}: WhatsappAccountFieldProps) => (
  <StyledContainer>
    <Field.Root>
      <Field.Label>{t('Account')}</Field.Label>
      <InputGroup
        startElement={
          <Avatar
            src={getPublicAssetUrl('whatsapp-logomark.svg')}
            name="WhatsApp"
            size="sm"
            shape="rounded-square"
          />
        }
      >
        <Input readOnly value={`${name} · ${handle}`} />
      </InputGroup>
    </Field.Root>
    {isAuthFailed && (
      <InlineBanner layout="compact" status="warning" fullWidth>
        {t(
          'This connection was unlinked from your phone. Reconnect your account to keep syncing.',
        )}
      </InlineBanner>
    )}
  </StyledContainer>
);
