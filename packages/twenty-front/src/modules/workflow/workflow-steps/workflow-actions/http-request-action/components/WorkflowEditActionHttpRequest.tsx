import { FormRawJsonFieldInput } from '@/object-record/record-field/ui/form-types/components/FormRawJsonFieldInput';
import { FormTextFieldInput } from '@/object-record/record-field/ui/form-types/components/FormTextFieldInput';
import { Select } from '@/ui/input/components/Select';
import { type WorkflowHttpRequestAction } from '@/workflow/types/Workflow';
import { WorkflowStepBody } from '@/workflow/workflow-steps/components/WorkflowStepBody';

import { CmdEnterActionButton } from '@/action-menu/components/CmdEnterActionButton';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { TabList } from '@/ui/layout/tab-list/components/TabList';
import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { WorkflowStepFooter } from '@/workflow/workflow-steps/components/WorkflowStepFooter';
import { getBodyTypeFromHeaders } from '@/workflow/workflow-steps/workflow-actions/http-request-action/utils/getBodyTypeFromHeaders';
import { isMethodWithBody } from '@/workflow/workflow-steps/workflow-actions/http-request-action/utils/isMethodWithBody';
import { WorkflowVariablePicker } from '@/workflow/workflow-variables/components/WorkflowVariablePicker';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { useEffect } from 'react';
import { IconPlayerPlay, IconSettings } from 'twenty-ui/display';
import {
  HTTP_METHODS,
  JSON_RESPONSE_PLACEHOLDER,
} from '@/workflow/workflow-steps/workflow-actions/http-request-action/constants/HttpRequest';
import { WORKFLOW_HTTP_REQUEST_TAB_LIST_COMPONENT_ID } from '@/workflow/workflow-steps/workflow-actions/http-request-action/constants/WorkflowHttpRequestTabListComponentId';
import { useHttpRequestForm } from '@/workflow/workflow-steps/workflow-actions/http-request-action/hooks/useHttpRequestForm';
import { useHttpRequestOutputSchema } from '@/workflow/workflow-steps/workflow-actions/http-request-action/hooks/useHttpRequestOutputSchema';
import { useTestHttpRequest } from '@/workflow/workflow-steps/workflow-actions/http-request-action/hooks/useTestHttpRequest';
import { WorkflowHttpRequestTabId } from '@/workflow/workflow-steps/workflow-actions/http-request-action/types/WorkflowHttpRequestTabId';
import { BodyInput } from './BodyInput';
import { HttpRequestExecutionResult } from './HttpRequestExecutionResult';
import { HttpRequestTestVariableInput } from './HttpRequestTestVariableInput';
import { KeyValuePairInput } from './KeyValuePairInput';

type WorkflowEditActionHttpRequestProps = {
  action: WorkflowHttpRequestAction;
  actionOptions: {
    readonly?: boolean;
    onActionUpdate?: (action: WorkflowHttpRequestAction) => void;
  };
};

const StyledTabList = styled(TabList)`
  background-color: ${({ theme }) => theme.background.secondary};
  padding-left: ${({ theme }) => theme.spacing(2)};
`;

const StyledTestTabContent = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  gap: ${({ theme }) => theme.spacing(4)};
  height: 100%;
  min-height: 400px;
`;

const StyledConfigurationTabContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(4)};
  height: 100%;
  flex: 1;
`;

const StyledFullHeightFormRawJsonFieldInput = styled(FormRawJsonFieldInput)`
  flex: 1;
  display: flex;
  flex-direction: column;

  & > div:last-child {
    flex: 1;
    display: flex;
    flex-direction: column;

    & > div {
      flex: 1;
      max-height: none !important;
      height: 100%;

      & > div {
        height: 100%;
      }
    }
  }
`;

export const WorkflowEditActionHttpRequest = ({
  action,
  actionOptions,
}: WorkflowEditActionHttpRequestProps) => {
  const { t } = useLingui();
  const theme = useTheme();
  const activeTabId = useRecoilComponentValue(
    activeTabIdComponentState,
    WORKFLOW_HTTP_REQUEST_TAB_LIST_COMPONENT_ID,
  );

  const { formData, handleFieldChange, saveAction } = useHttpRequestForm({
    action,
    onActionUpdate: actionOptions.onActionUpdate,
    readonly: actionOptions.readonly === true,
  });
  const { outputSchema, handleOutputSchemaChange, error } =
    useHttpRequestOutputSchema({
      action,
      onActionUpdate: actionOptions.onActionUpdate,
      readonly: actionOptions.readonly === true,
    });
  const { testHttpRequest, isTesting, httpRequestTestData } =
    useTestHttpRequest(action.id);

  const handleTestRequest = async () => {
    if (actionOptions.readonly === true) {
      return;
    }
    await testHttpRequest(formData, httpRequestTestData.variableValues);
  };

  const tabs = [
    {
      id: WorkflowHttpRequestTabId.CONFIGURATION,
      title: t`Configuration`,
      Icon: IconSettings,
    },
    { id: WorkflowHttpRequestTabId.TEST, title: t`Test`, Icon: IconPlayerPlay },
  ];

  useEffect(() => () => saveAction.flush(), [saveAction]);

  return (
    <>
      <StyledTabList
        tabs={tabs}
        behaveAsLinks={false}
        componentInstanceId={WORKFLOW_HTTP_REQUEST_TAB_LIST_COMPONENT_ID}
      />
      <WorkflowStepBody>
        {activeTabId === WorkflowHttpRequestTabId.CONFIGURATION && (
          <StyledConfigurationTabContent>
            <FormTextFieldInput
              label={t`URL`}
              placeholder={t`https://api.example.com/endpoint`}
              readonly={actionOptions.readonly}
              defaultValue={formData.url}
              onChange={(value) => handleFieldChange('url', value)}
              VariablePicker={WorkflowVariablePicker}
            />
            <Select
              label={t`HTTP Method`}
              dropdownId="http-method"
              options={[...HTTP_METHODS]}
              value={formData.method}
              onChange={(value) => handleFieldChange('method', value)}
              disabled={actionOptions.readonly}
              dropdownOffset={{ y: parseInt(theme.spacing(1), 10) }}
              dropdownWidth={GenericDropdownContentWidth.ExtraLarge}
            />

            <KeyValuePairInput
              key={getBodyTypeFromHeaders(formData.headers) || 'none'}
              label={t`Headers Input`}
              defaultValue={formData.headers}
              onChange={(value) => handleFieldChange('headers', value)}
              readonly={actionOptions.readonly}
              keyPlaceholder={t`Header name`}
              valuePlaceholder={t`Header value`}
            />

            {isMethodWithBody(formData.method) && (
              <BodyInput
                defaultValue={formData.body}
                onChange={(value, type = 'body') =>
                  handleFieldChange(type, value)
                }
                readonly={actionOptions.readonly}
                headers={formData.headers}
              />
            )}

            <StyledFullHeightFormRawJsonFieldInput
              label={t`Expected Response Body`}
              placeholder={JSON_RESPONSE_PLACEHOLDER}
              defaultValue={outputSchema}
              onChange={handleOutputSchemaChange}
              readonly={actionOptions.readonly}
              error={error}
            />
          </StyledConfigurationTabContent>
        )}
        {activeTabId === WorkflowHttpRequestTabId.TEST && (
          <StyledTestTabContent>
            <HttpRequestTestVariableInput
              httpRequestFormData={formData}
              actionId={action.id}
              readonly={actionOptions.readonly}
            />
            <HttpRequestExecutionResult
              httpRequestTestData={httpRequestTestData}
              isTesting={isTesting}
            />
          </StyledTestTabContent>
        )}
      </WorkflowStepBody>
      {!actionOptions.readonly && (
        <WorkflowStepFooter
          stepId={action.id}
          additionalActions={
            activeTabId === WorkflowHttpRequestTabId.TEST
              ? [
                  <CmdEnterActionButton
                    title={t`Test`}
                    onClick={handleTestRequest}
                    disabled={isTesting}
                  />,
                ]
              : []
          }
        />
      )}
    </>
  );
};
