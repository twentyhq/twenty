import { SidePanelHeader } from '@/command-menu/components/SidePanelHeader';
import { usePageLayoutIdFromContextStoreTargetedRecord } from '@/command-menu/pages/page-layout/hooks/usePageLayoutFromContextStoreTargetedRecord';
import { useWidgetInEditMode } from '@/command-menu/pages/page-layout/hooks/useWidgetInEditMode';
import { FormTextFieldInput } from '@/object-record/record-field/ui/form-types/components/FormTextFieldInput';
import { useUpdatePageLayoutWidget } from '@/page-layout/hooks/useUpdatePageLayoutWidget';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
import { isNonEmptyString, isString } from '@sniptt/guards';
import { useState } from 'react';
import { isDefined, isValidUrl } from 'twenty-shared/utils';
import { IconFrame } from 'twenty-ui/display';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(3)};
  padding: ${({ theme }) => theme.spacing(2)};
`;

export const CommandMenuPageLayoutIframeSettings = () => {
  const { pageLayoutId } = usePageLayoutIdFromContextStoreTargetedRecord();

  const theme = useTheme();

  const { widgetInEditMode } = useWidgetInEditMode(pageLayoutId);

  const { updatePageLayoutWidget } = useUpdatePageLayoutWidget(pageLayoutId);

  if (!isDefined(widgetInEditMode)) {
    throw new Error('Widget ID must be present while editing the widget');
  }

  const configUrl =
    widgetInEditMode.configuration && 'url' in widgetInEditMode.configuration
      ? widgetInEditMode.configuration.url
      : null;

  const [url, setUrl] = useState<string | null>(
    isString(configUrl) ? configUrl : null,
  );
  const [urlError, setUrlError] = useState('');

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

    if (validateUrl(value)) {
      const trimmedValue = value.trim();
      updatePageLayoutWidget(widgetInEditMode.id, {
        configuration: {
          ...widgetInEditMode.configuration,
          url: trimmedValue || null,
        },
      });
    }
  };

  return (
    <>
      <SidePanelHeader
        Icon={IconFrame}
        iconColor={theme.font.color.tertiary}
        initialTitle={widgetInEditMode.title}
        headerType={t`iFrame Widget`}
        onTitleChange={(newTitle) => {
          if (!isNonEmptyString(newTitle)) {
            return;
          }

          updatePageLayoutWidget(widgetInEditMode.id, {
            title: newTitle,
          });
        }}
      />
      <StyledContainer>
        <FormTextFieldInput
          label={t`URL to Embed`}
          placeholder="https://example.com/embed"
          defaultValue={url}
          onChange={handleUrlChange}
          error={urlError}
        />
      </StyledContainer>
    </>
  );
};
