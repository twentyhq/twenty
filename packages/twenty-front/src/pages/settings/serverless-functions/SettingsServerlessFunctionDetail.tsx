import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useTestServerlessFunction } from '@/serverless-functions/hooks/useTestServerlessFunction';
import { computeNewSources } from '@/serverless-functions/utils/computeNewSources';
import { flattenSources } from '@/serverless-functions/utils/flattenSources';
import { getToolInputSchemaFromSourceCode } from '@/serverless-functions/utils/getToolInputSchemaFromSourceCode';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsServerlessFunctionLabelContainer } from '@/settings/serverless-functions/components/SettingsServerlessFunctionLabelContainer';
import { SettingsServerlessFunctionCodeEditorTab } from '@/settings/serverless-functions/components/tabs/SettingsServerlessFunctionCodeEditorTab';
import { SettingsServerlessFunctionSettingsTab } from '@/settings/serverless-functions/components/tabs/SettingsServerlessFunctionSettingsTab';
import { SettingsServerlessFunctionTestTab } from '@/settings/serverless-functions/components/tabs/SettingsServerlessFunctionTestTab';
import { SettingsServerlessFunctionTriggersTab } from '@/settings/serverless-functions/components/tabs/SettingsServerlessFunctionTriggersTab';
import { usePersistServerlessFunction } from '@/settings/serverless-functions/hooks/usePersistServerlessFunction';
import { useServerlessFunctionUpdateFormState } from '@/settings/serverless-functions/hooks/useServerlessFunctionUpdateFormState';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { TabList } from '@/ui/layout/tab-list/components/TabList';
import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { t } from '@lingui/core/macro';
import { useNavigate, useParams } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';
import {
  IconBolt,
  IconCode,
  IconSettings,
  IconTestPipe,
} from 'twenty-ui/display';
import { useDebouncedCallback } from 'use-debounce';
import { useFindOneApplicationQuery } from '~/generated-metadata/graphql';

const SERVERLESS_FUNCTION_DETAIL_ID = 'serverless-function-detail';

export const SettingsServerlessFunctionDetail = () => {
  const { serverlessFunctionId = '', applicationId = '' } = useParams();

  const navigate = useNavigate();
  const currentWorkspace = useRecoilValue(currentWorkspaceState);

  const { data } = useFindOneApplicationQuery({
    variables: { id: applicationId },
    skip: !applicationId,
  });

  const applicationName = data?.findOneApplication?.name;

  // A serverless function is "managed" if it belongs to an application
  // other than the workspace's custom application
  const workspaceCustomApplicationId =
    currentWorkspace?.workspaceCustomApplication?.id;
  const isManaged =
    isDefined(applicationId) &&
    applicationId !== '' &&
    applicationId !== workspaceCustomApplicationId;

  const instanceId = `${SERVERLESS_FUNCTION_DETAIL_ID}-${serverlessFunctionId}`;

  const activeTabId = useRecoilComponentValue(
    activeTabIdComponentState,
    instanceId,
  );
  const { updateServerlessFunction } = usePersistServerlessFunction();

  const { formValues, setFormValues, serverlessFunction, loading } =
    useServerlessFunctionUpdateFormState({ serverlessFunctionId });

  const { testServerlessFunction, isTesting } = useTestServerlessFunction({
    serverlessFunctionId,
  });

  const handleSave = useDebouncedCallback(
    async (toolInputSchema?: object | null) => {
      await updateServerlessFunction({
        input: {
          id: serverlessFunctionId,
          update: {
            name: formValues.name,
            description: formValues.description,
            code: formValues.code,
            ...(toolInputSchema !== undefined && { toolInputSchema }),
          },
        },
      });
    },
    500,
  );

  const onChange = (key: string) => {
    return async (value: string) => {
      setFormValues((prevState) => ({
        ...prevState,
        [key]: value,
      }));
      await handleSave();
    };
  };

  const onCodeChange = async (filePath: string, value: string) => {
    setFormValues((prevState) => {
      return {
        ...prevState,
        code: computeNewSources({
          previousCode: prevState['code'],
          filePath,
          value,
        }),
      };
    });

    // Parse and save schema if editing the handler file
    let toolInputSchema: object | null | undefined;

    if (filePath === serverlessFunction?.handlerPath) {
      toolInputSchema = await getToolInputSchemaFromSourceCode(value);
    }

    await handleSave(toolInputSchema);
  };

  const handleTestFunction = async () => {
    navigate('#test');
    await testServerlessFunction();
  };

  const tabs = [
    { id: 'editor', title: t`Editor`, Icon: IconCode },
    { id: 'triggers', title: t`Triggers`, Icon: IconBolt },
    { id: 'test', title: t`Test`, Icon: IconTestPipe },
    { id: 'settings', title: t`Settings`, Icon: IconSettings },
  ];

  const flattenedCode = flattenSources(formValues.code);

  const files = flattenedCode
    .map((file) => ({
      path: file.path,
      language: 'typescript',
      content: file.content,
    }))
    .sort((a, b) =>
      a.path === serverlessFunction?.handlerPath
        ? -1
        : b.path === serverlessFunction?.handlerPath
          ? 1
          : 0,
    );

  const isEditorTab = activeTabId === 'editor';
  const isTriggersTab = activeTabId === 'triggers';
  const isTestTab = activeTabId === 'test';
  const isSettingsTab = activeTabId === 'settings';

  const breadcrumbLinks =
    isDefined(applicationId) && applicationId !== ''
      ? [
          {
            children: t`Workspace`,
            href: getSettingsPath(SettingsPath.Workspace),
          },
          {
            children: t`Applications`,
            href: getSettingsPath(SettingsPath.Applications),
          },
          {
            children: `${applicationName}`,
            href: getSettingsPath(
              SettingsPath.ApplicationDetail,
              {
                applicationId,
              },
              undefined,
              'content',
            ),
          },
          { children: `${serverlessFunction?.name}` },
        ]
      : [
          {
            children: t`Workspace`,
            href: getSettingsPath(SettingsPath.Workspace),
          },
          {
            children: t`AI`,
            href: getSettingsPath(SettingsPath.AI),
          },
          { children: `${serverlessFunction?.name}` },
        ];

  return (
    !loading && (
      <SubMenuTopBarContainer
        title={
          <SettingsServerlessFunctionLabelContainer
            value={formValues.name}
            onChange={onChange('name')}
          />
        }
        links={breadcrumbLinks}
      >
        <SettingsPageContainer>
          <TabList tabs={tabs} componentInstanceId={instanceId} />
          {isEditorTab && (
            <SettingsServerlessFunctionCodeEditorTab
              files={files}
              handleExecute={handleTestFunction}
              onChange={onCodeChange}
              isTesting={isTesting}
              isManaged={isManaged}
            />
          )}
          {isTriggersTab && serverlessFunction && (
            <SettingsServerlessFunctionTriggersTab
              serverlessFunction={serverlessFunction}
            />
          )}
          {isTestTab && (
            <SettingsServerlessFunctionTestTab
              serverlessFunctionId={serverlessFunctionId}
              handleExecute={handleTestFunction}
              isTesting={isTesting}
            />
          )}
          {isSettingsTab && (
            <SettingsServerlessFunctionSettingsTab
              formValues={formValues}
              onChange={onChange}
            />
          )}
        </SettingsPageContainer>
      </SubMenuTopBarContainer>
    )
  );
};
