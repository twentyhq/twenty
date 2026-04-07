import { FormTextFieldInput } from '@/object-record/record-field/ui/form-types/components/FormTextFieldInput';
import { useUpdatePageLayoutWidget } from '@/page-layout/hooks/useUpdatePageLayoutWidget';
import { WidgetSettingsFooter } from '@/side-panel/pages/page-layout/components/WidgetSettingsFooter';
import { usePageLayoutIdFromContextStore } from '@/side-panel/pages/page-layout/hooks/usePageLayoutIdFromContextStore';
import { useWidgetInEditMode } from '@/side-panel/pages/page-layout/hooks/useWidgetInEditMode';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { isNonEmptyString, isString } from '@sniptt/guards';
import { useState } from 'react';
import { isDefined, isValidUrl } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { WidgetConfigurationType } from '~/generated-metadata/graphql';

const StyledOuterContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const StyledContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
  padding: ${themeCssVariables.spacing[2]};
`;

export const SidePanelPageLayoutIframeSettings = () => {
  const { pageLayoutId } = usePageLayoutIdFromContextStore();

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
    <StyledOuterContainer>
      <StyledContainer>
        <FormTextFieldInput
          label={t`URL to Embed`}
          placeholder={t`https://example.com/embed`}
          defaultValue={url}
          onChange={handleUrlChange}
          error={urlError}
        />
      </StyledContainer>
      <WidgetSettingsFooter pageLayoutId={pageLayoutId} />
    </StyledOuterContainer>
  );
};
