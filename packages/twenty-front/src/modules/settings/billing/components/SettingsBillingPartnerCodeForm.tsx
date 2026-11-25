import { isErrorLike } from '@apollo/client/errors';
import { useMutation, useQuery } from '@apollo/client/react';
import { styled } from '@linaria/react';
import { isNonEmptyString } from '@sniptt/guards';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { useToast } from 'twenty-ui/components/feedback';
import { Section } from 'twenty-ui/components/layout';
import { Button } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme';

import { getToastOptionsFromError } from '@/error-handler/utils/getToastOptionsFromError';
import { SettingsTextInput } from '@/ui/input/components/SettingsTextInput';
import { getErrorMessageFromApolloError } from '~/utils/get-error-message-from-apollo-error.util';
import {
  BillingPartnerCodeDocument,
  SetBillingPartnerCodeDocument,
} from '~/generated-metadata/graphql';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[0.5]};
  width: 100%;
`;

const StyledRow = styled.div`
  align-items: flex-end;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledHint = styled.span<{ isError: boolean }>`
  color: ${({ isError }) =>
    isError
      ? themeCssVariables.font.color.danger
      : themeCssVariables.font.color.light};
  font-size: ${themeCssVariables.font.size.xs};
`;

export const SettingsBillingPartnerCodeForm = () => {
  const { t } = useLingui();
  const { enqueueToast } = useToast();

  const { data } = useQuery(BillingPartnerCodeDocument);
  const [setBillingPartnerCode, { loading }] = useMutation(
    SetBillingPartnerCodeDocument,
    { refetchQueries: [BillingPartnerCodeDocument], awaitRefetchQueries: true },
  );

  const [draftPartnerCode, setDraftPartnerCode] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isDefined(data)) {
    return null;
  }

  const { partnerCode, isEditable } = data.billingPartnerCode;

  if (!isEditable && !isDefined(partnerCode)) {
    return (
      <Section.Root>
        <Section.Header
          title={t`Partner`}
          description={t`Partner codes can only be added during the free trial.`}
        />
      </Section.Root>
    );
  }

  const savedPartnerCode = partnerCode?.toUpperCase() ?? '';
  const displayedPartnerCode = draftPartnerCode ?? savedPartnerCode;
  const trimmedPartnerCode = displayedPartnerCode.trim();

  const canApply =
    isEditable && !loading && isNonEmptyString(trimmedPartnerCode);

  const handleChange = (value: string) => {
    setDraftPartnerCode(value);
    setErrorMessage(null);
  };

  const handleApply = async () => {
    if (!canApply) {
      return;
    }

    try {
      await setBillingPartnerCode({
        variables: { partnerCode: trimmedPartnerCode },
      });
      setDraftPartnerCode(null);
      setErrorMessage(null);
      enqueueToast({ status: 'success', children: t`Partner code applied` });
    } catch (error) {
      if (isErrorLike(error)) {
        setErrorMessage(getErrorMessageFromApolloError(error));
      } else {
        enqueueToast(getToastOptionsFromError({ error }));
      }
    }
  };

  const hint =
    errorMessage ??
    (isEditable
      ? t`Only if a Twenty partner referred you. Once applied, it can't be changed.`
      : null);

  return (
    <Section.Root>
      <Section.Header
        title={t`Partner`}
        description={t`The code of the Twenty partner who referred you`}
      />
      <StyledContainer>
        <StyledRow>
          <SettingsTextInput
            instanceId="settings-partner-code"
            label={t`Partner code`}
            placeholder={t`Optional`}
            value={displayedPartnerCode}
            onChange={handleChange}
            error={errorMessage ?? undefined}
            noErrorHelper
            onInputEnter={handleApply}
            disabled={!isEditable}
          />
          {isEditable && (
            <Button
              variant="outline"
              onClick={handleApply}
              disabled={!canApply}
              loading={loading}
            >{t`Apply`}</Button>
          )}
        </StyledRow>
        {isDefined(hint) && (
          <StyledHint isError={isDefined(errorMessage)}>{hint}</StyledHint>
        )}
      </StyledContainer>
    </Section.Root>
  );
};
