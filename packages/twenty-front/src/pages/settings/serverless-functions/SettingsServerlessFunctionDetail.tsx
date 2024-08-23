import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsServerlessFunctionCodeEditorTab } from '@/settings/serverless-functions/components/tabs/SettingsServerlessFunctionCodeEditorTab';
import { SettingsServerlessFunctionSettingsTab } from '@/settings/serverless-functions/components/tabs/SettingsServerlessFunctionSettingsTab';
import { SettingsServerlessFunctionTestTab } from '@/settings/serverless-functions/components/tabs/SettingsServerlessFunctionTestTab';
import { SettingsServerlessFunctionTestTabEffect } from '@/settings/serverless-functions/components/tabs/SettingsServerlessFunctionTestTabEffect';
import { useExecuteOneServerlessFunction } from '@/settings/serverless-functions/hooks/useExecuteOneServerlessFunction';
import { useServerlessFunctionUpdateFormState } from '@/settings/serverless-functions/hooks/useServerlessFunctionUpdateFormState';
import { useUpdateOneServerlessFunction } from '@/settings/serverless-functions/hooks/useUpdateOneServerlessFunction';
import { usePublishOneServerlessFunction } from '@/settings/serverless-functions/hooks/usePublishOneServerlessFunction';
import { settingsServerlessFunctionInputState } from '@/settings/serverless-functions/states/settingsServerlessFunctionInputState';
import { settingsServerlessFunctionOutputState } from '@/settings/serverless-functions/states/settingsServerlessFunctionOutputState';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { SubMenuTopBarContainer } from '@/ui/layout/page/SubMenuTopBarContainer';
import { Section } from '@/ui/layout/section/components/Section';
import { TabList } from '@/ui/layout/tab/components/TabList';
import { useTabList } from '@/ui/layout/tab/hooks/useTabList';
import { Breadcrumb } from '@/ui/navigation/bread-crumb/components/Breadcrumb';
import { useParams } from 'react-router-dom';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { IconCode, IconFunction, IconSettings, IconTestPipe } from 'twenty-ui';
import { isDefined } from '~/utils/isDefined';
import { useDebouncedCallback } from 'use-debounce';
import { useGetOneServerlessFunctionSourceCode } from '@/settings/serverless-functions/hooks/useGetOneServerlessFunctionSourceCode';
import { useState } from 'react';

const TAB_LIST_COMPONENT_ID = 'serverless-function-detail';

export const SettingsServerlessFunctionDetail = () => {
  const { serverlessFunctionId = '' } = useParams();
  const { enqueueSnackBar } = useSnackBar();
  const { activeTabIdState, setActiveTabId } = useTabList(
    TAB_LIST_COMPONENT_ID,
  );
  const activeTabId = useRecoilValue(activeTabIdState);
  const [isCodeValid, setIsCodeValid] = useState(true);
  const { executeOneServerlessFunction } = useExecuteOneServerlessFunction();
  const { updateOneServerlessFunction } = useUpdateOneServerlessFunction();
  const { publishOneServerlessFunction } = usePublishOneServerlessFunction();
  const [formValues, setFormValues] =
    useServerlessFunctionUpdateFormState(serverlessFunctionId);
  const { code: latestVersionCode } = useGetOneServerlessFunctionSourceCode({
    id: serverlessFunctionId,
    version: 'latest',
  });
  const setSettingsServerlessFunctionOutput = useSetRecoilState(
    settingsServerlessFunctionOutputState,
  );
  const settingsServerlessFunctionInput = useRecoilValue(
    settingsServerlessFunctionInputState,
  );

  const save = async () => {
    try {
      await updateOneServerlessFunction({
        id: serverlessFunctionId,
        name: formValues.name,
        description: formValues.description,
        code: formValues.code,
      });
    } catch (err) {
      enqueueSnackBar(
        (err as Error)?.message || 'An error occurred while updating function',
        {
          variant: SnackBarVariant.Error,
        },
      );
    }
  };

  const handleSave = useDebouncedCallback(save, 500);

  const onChange = (key: string) => {
    return async (value: string | undefined) => {
      setFormValues((prevState) => ({
        ...prevState,
        [key]: value,
      }));
      await handleSave();
    };
  };

  const resetDisabled =
    !isDefined(latestVersionCode) || latestVersionCode === formValues.code;
  const publishDisabled = !isCodeValid || latestVersionCode === formValues.code;

  const handleReset = async () => {
    try {
      const newState = {
        code: latestVersionCode || '',
      };
      setFormValues((prevState) => ({
        ...prevState,
        ...newState,
      }));
      await handleSave();
    } catch (err) {
      enqueueSnackBar(
        (err as Error)?.message || 'An error occurred while reset function',
        {
          variant: SnackBarVariant.Error,
        },
      );
    }
  };

  const handlePublish = async () => {
    try {
      await publishOneServerlessFunction({
        id: serverlessFunctionId,
      });
      enqueueSnackBar(`New function version has been published`, {
        variant: SnackBarVariant.Success,
      });
    } catch (err) {
      enqueueSnackBar(
        (err as Error)?.message ||
          'An error occurred while publishing new version',
        {
          variant: SnackBarVariant.Error,
        },
      );
    }
  };

  const handleExecute = async () => {
    try {
      const result = await executeOneServerlessFunction({
        id: serverlessFunctionId,
        payload: JSON.parse(settingsServerlessFunctionInput),
        version: 'draft',
      });
      setSettingsServerlessFunctionOutput({
        data: result?.data?.executeOneServerlessFunction?.data
          ? JSON.stringify(
              result?.data?.executeOneServerlessFunction?.data,
              null,
              4,
            )
          : undefined,
        duration: result?.data?.executeOneServerlessFunction?.duration,
        status: result?.data?.executeOneServerlessFunction?.status,
        error: result?.data?.executeOneServerlessFunction?.error
          ? JSON.stringify(
              result?.data?.executeOneServerlessFunction?.error,
              null,
              4,
            )
          : undefined,
      });
    } catch (err) {
      enqueueSnackBar(
        (err as Error)?.message || 'An error occurred while executing function',
        {
          variant: SnackBarVariant.Error,
        },
      );
    }
    setActiveTabId('test');
  };

  const tabs = [
    { id: 'editor', title: 'Editor', Icon: IconCode },
    { id: 'test', title: 'Test', Icon: IconTestPipe },
    { id: 'settings', title: 'Settings', Icon: IconSettings },
  ];

  const renderActiveTabContent = () => {
    switch (activeTabId) {
      case 'editor':
        return (
          <SettingsServerlessFunctionCodeEditorTab
            formValues={formValues}
            handleExecute={handleExecute}
            handlePublish={handlePublish}
            handleReset={handleReset}
            resetDisabled={resetDisabled}
            publishDisabled={publishDisabled}
            onChange={onChange}
            setIsCodeValid={setIsCodeValid}
          />
        );
      case 'test':
        return (
          <>
            <SettingsServerlessFunctionTestTabEffect />
            <SettingsServerlessFunctionTestTab handleExecute={handleExecute} />
          </>
        );
      case 'settings':
        return (
          <SettingsServerlessFunctionSettingsTab
            formValues={formValues}
            serverlessFunctionId={serverlessFunctionId}
            onChange={onChange}
          />
        );
      default:
        return <></>;
    }
  };

  return (
    formValues.name && (
      <SubMenuTopBarContainer
        Icon={IconFunction}
        title={
          <Breadcrumb
            links={[
              { children: 'Functions', href: '/settings/functions' },
              { children: `${formValues.name}` },
            ]}
          />
        }
      >
        <SettingsPageContainer>
          <Section>
            <TabList tabListId={TAB_LIST_COMPONENT_ID} tabs={tabs} />
          </Section>
          {renderActiveTabContent()}
        </SettingsPageContainer>
      </SubMenuTopBarContainer>
    )
  );
};
