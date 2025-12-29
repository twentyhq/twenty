import { usePageLayoutIdFromContextStoreTargetedRecord } from '@/command-menu/pages/page-layout/hooks/usePageLayoutFromContextStoreTargetedRecord';
import { useWidgetInEditMode } from '@/command-menu/pages/page-layout/hooks/useWidgetInEditMode';
import { FormTextFieldInput } from '@/object-record/record-field/ui/form-types/components/FormTextFieldInput';
import { useUpdatePageLayoutWidget } from '@/page-layout/hooks/useUpdatePageLayoutWidget';
import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
import { isNonEmptyString, isString } from '@sniptt/guards';
import { useState } from 'react';
import { isDefined, isValidUrl } from 'twenty-shared/utils';
import { WidgetConfigurationType } from '~/generated/graphql';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(3)};
  padding: ${({ theme }) => theme.spacing(2)};
`;

export const CommandMenuPageLayoutIframeSettings = () => {
  const { pageLayoutId } = usePageLayoutIdFromContextStoreTargetedRecord();

  const { widgetInEditMode } = useWidgetInEditMode(pageLayoutId);

  const { updatePageLayoutWidget } = useUpdatePageLayoutWidget(pageLayoutId);

  const widgetConfiguration = widgetInEditMode?.configuration;

  const configUrl =
    widgetConfiguration && 'url' in widgetConfiguration
      ? widgetConfiguration.url
      : null;

  const [url, setUrl] = useState<string | null>(
    isString(configUrl) ? configUrl : null,
  );
  const [urlError, setUrlError] = useState('');

  if (!isDefined(widgetInEditMode)) {
    return null;
  }

  const validateUrl = (urlString: string): boolean => {
    const trimmedUrl = urlString.trim();

    if (!isNonEmptyString(trimmedUrl)) {
      setUrlError('');
      return true;
    }

    if (!isValidUrl(trimmedUrl)) {
      setUrlError(t`Please enter a valid URL`);
      return false;
    }

    setUrlError('');
    return true;
  };

  const handleUrlChange = (value: string) => {
    setUrl(value);

    if (!validateUrl(value)) {
      return;
    }

    const trimmedValue = value.trim();

    updatePageLayoutWidget(widgetInEditMode.id, {
      configuration: {
        __typename: 'IframeConfiguration',
        configurationType: WidgetConfigurationType.IFRAME,
        url: isNonEmptyString(trimmedValue) ? trimmedValue : null,
      },
    });
  };

  return (
    <>
      <StyledContainer>
        <FormTextFieldInput
          label={t`URL to Embed`}
          placeholder={t`https://example.com/embed`}
          defaultValue={url}
          onChange={handleUrlChange}
          error={urlError}
        />
      </StyledContainer>
    </>
  );
};
