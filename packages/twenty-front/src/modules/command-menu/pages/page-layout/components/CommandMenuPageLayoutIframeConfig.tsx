import { useCommandMenu } from '@/command-menu/hooks/useCommandMenu';
import { FormTextFieldInput } from '@/object-record/record-field/ui/form-types/components/FormTextFieldInput';
import { usePageLayoutIframeWidgetCreate } from '@/settings/page-layout/hooks/usePageLayoutIframeWidgetCreate';
import { usePageLayoutWidgetUpdate } from '@/settings/page-layout/hooks/usePageLayoutWidgetUpdate';
import { pageLayoutEditingWidgetIdState } from '@/settings/page-layout/states/pageLayoutEditingWidgetIdState';
import { pageLayoutWidgetsState } from '@/settings/page-layout/states/pageLayoutWidgetsState';
import styled from '@emotion/styled';
import { useState } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
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
  const { handleCreateIframeWidget } = usePageLayoutIframeWidgetCreate();
  const { handleUpdateWidget } = usePageLayoutWidgetUpdate();
  const [pageLayoutEditingWidgetId, setPageLayoutEditingWidgetId] =
    useRecoilState(pageLayoutEditingWidgetIdState);
  const pageLayoutWidgets = useRecoilValue(pageLayoutWidgetsState);

  const editingWidget = pageLayoutWidgets.find(
    (w) => w.id === pageLayoutEditingWidgetId,
  );
  const isEditMode = !!editingWidget;

  const [title, setTitle] = useState(editingWidget?.title || '');
  const [url, setUrl] = useState(
    editingWidget?.configuration?.url || editingWidget?.data?.url || '',
  );
  const [urlError, setUrlError] = useState('');

  const validateUrl = (urlString: string): boolean => {
    if (!urlString) {
      setUrlError('URL is required');
      return false;
    }

    try {
      const urlObj = new URL(urlString);
      if (!['http:', 'https:'].includes(urlObj.protocol)) {
        setUrlError('URL must start with http:// or https://');
        return false;
      }
      setUrlError('');
      return true;
    } catch {
      setUrlError('Please enter a valid URL');
      return false;
    }
  };

  const handleUrlChange = (value: string) => {
    setUrl(value);
    if (isDefined(value)) {
      validateUrl(value);
    } else {
      setUrlError('');
    }
  };

  const handleSubmit = () => {
    if (!title.trim()) {
      return;
    }

    if (!validateUrl(url)) {
      return;
    }

    if (isEditMode && pageLayoutEditingWidgetId !== null) {
      handleUpdateWidget(pageLayoutEditingWidgetId, {
        title: title.trim(),
        configuration: {
          ...editingWidget?.configuration,
          url: url.trim(),
        },
        data: {
          ...editingWidget?.data,
          url: url.trim(),
        },
      });
      setPageLayoutEditingWidgetId(null);
    } else {
      handleCreateIframeWidget(title.trim(), url.trim());
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
