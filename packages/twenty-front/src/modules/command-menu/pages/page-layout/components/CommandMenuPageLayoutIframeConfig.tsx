import { useCommandMenu } from '@/command-menu/hooks/useCommandMenu';
import { usePageLayoutIdFromContextStoreTargetedRecord } from '@/command-menu/pages/page-layout/hooks/usePageLayoutFromContextStoreTargetedRecord';
import { FormTextFieldInput } from '@/object-record/record-field/ui/form-types/components/FormTextFieldInput';
import { useCreatePageLayoutIframeWidget } from '@/page-layout/hooks/useCreatePageLayoutIframeWidget';
import { useUpdatePageLayoutWidget } from '@/page-layout/hooks/useUpdatePageLayoutWidget';
import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { pageLayoutEditingWidgetIdComponentState } from '@/page-layout/states/pageLayoutEditingWidgetIdComponentState';
import { useRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import styled from '@emotion/styled';
import { isString } from '@sniptt/guards';
import { useState } from 'react';
import { isValidUrl } from 'twenty-shared/utils';
import { Button } from 'twenty-ui/input';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: ${({ theme }) => theme.spacing(2)};
  gap: ${({ theme }) => theme.spacing(3)};
`;

const StyledSectionTitle = styled.div`
  color: ${({ theme }) => theme.font.color.tertiary};
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  padding-left: ${({ theme }) => theme.spacing(1)};
`;

const StyledButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: ${({ theme }) => theme.spacing(2)};
`;

export const CommandMenuPageLayoutIframeConfig = () => {
  const { closeCommandMenu } = useCommandMenu();

  const { pageLayoutId } = usePageLayoutIdFromContextStoreTargetedRecord();

  const { createPageLayoutIframeWidget } =
    useCreatePageLayoutIframeWidget(pageLayoutId);

  const { updatePageLayoutWidget } = useUpdatePageLayoutWidget(pageLayoutId);

  const [pageLayoutEditingWidgetId, setPageLayoutEditingWidgetId] =
    useRecoilComponentState(
      pageLayoutEditingWidgetIdComponentState,
      pageLayoutId,
    );
  const pageLayoutDraft = useRecoilComponentValue(
    pageLayoutDraftComponentState,
    pageLayoutId,
  );

  const allWidgets = pageLayoutDraft.tabs.flatMap((tab) => tab.widgets);

  const editingWidget = allWidgets.find(
    (w) => w.id === pageLayoutEditingWidgetId,
  );
  const isEditMode = !!editingWidget;

  const [title, setTitle] = useState(editingWidget?.title || '');

  const configUrl =
    editingWidget?.configuration && 'url' in editingWidget.configuration
      ? editingWidget.configuration.url
      : undefined;

  const [url, setUrl] = useState(isString(configUrl) ? configUrl : '');

  const [urlError, setUrlError] = useState('');

  const validateUrl = (urlString: string): boolean => {
    const trimmedUrl = urlString.trim();

    if (!isValidUrl(trimmedUrl)) {
      setUrlError('Please enter a valid URL');
      return false;
    }

    setUrlError('');
    return true;
  };

  const handleUrlChange = (value: string) => {
    setUrl(value);
    validateUrl(value);
  };

  const handleSubmit = () => {
    if (!title.trim()) {
      return;
    }

    if (!validateUrl(url)) {
      return;
    }

    if (isEditMode && pageLayoutEditingWidgetId !== null) {
      updatePageLayoutWidget(pageLayoutEditingWidgetId, {
        title: title.trim(),
        configuration: {
          ...editingWidget?.configuration,
          url: url.trim(),
        },
      });

      setPageLayoutEditingWidgetId(null);
    } else {
      createPageLayoutIframeWidget(title.trim(), url.trim());
    }

    closeCommandMenu();
  };

  const isFormValid = title.trim() && url.trim() && !urlError;

  return (
    <StyledContainer>
      <StyledSectionTitle>
        {isEditMode ? 'Edit iFrame Widget' : 'Configure iFrame Widget'}
      </StyledSectionTitle>

      <FormTextFieldInput
        label="Widget Title"
        placeholder="e.g., Analytics Dashboard"
        defaultValue={title}
        onChange={setTitle}
      />

      <FormTextFieldInput
        label="URL to Embed"
        placeholder="https://example.com/embed"
        defaultValue={url}
        onChange={handleUrlChange}
        error={urlError}
      />

      <StyledButtonContainer>
        <Button
          title={isEditMode ? 'Save Changes' : 'Create Widget'}
          onClick={handleSubmit}
          disabled={!isFormValid}
          variant="primary"
          size="small"
        />
      </StyledButtonContainer>
    </StyledContainer>
  );
};
