import { useNavigate, useParams } from 'react-router-dom';
import {
  H2Title,
  IconCode,
  IconSettings,
  IconPlayerPlay,
  IconTestPipe,
} from 'twenty-ui';
import { SubMenuTopBarContainer } from '@/ui/layout/page/SubMenuTopBarContainer';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { Breadcrumb } from '@/ui/navigation/bread-crumb/components/Breadcrumb';
import { SettingsHeaderContainer } from '@/settings/components/SettingsHeaderContainer';
import { useGetOneServerlessFunction } from '@/settings/serverless-functions/hooks/useGetOneServerlessFunction';
import { Section } from '@/ui/layout/section/components/Section';
import { TabList } from '@/ui/layout/tab/components/TabList';
import styled from '@emotion/styled';
import { useEffect, useState } from 'react';
import { isDefined } from '~/utils/isDefined';
import { SaveAndCancelButtons } from '@/settings/components/SaveAndCancelButtons/SaveAndCancelButtons';
import { getFileAbsoluteURI } from '~/utils/file/getFileAbsoluteURI';
import { useTabList } from '@/ui/layout/tab/hooks/useTabList';
import { useRecoilValue } from 'recoil';
import { SettingsServerlessFunctionCodeEditorTab } from '@/settings/serverless-functions/components/tabs/SettingsServerlessFunctionCodeEditorTab';
import { SettingsServerlessFunctionSettingsTab } from '@/settings/serverless-functions/components/tabs/SettingsServerlessFunctionSettingsTab';
import { useServerlessFunctionFormValues } from '@/settings/serverless-functions/forms/useServerlessFunctionFormValues';
import { SettingsServerlessFunctionTestTab } from '@/settings/serverless-functions/components/tabs/SettingsServerlessFunctionTestTab';
import { useExecuteOneServerlessFunction } from '@/settings/serverless-functions/hooks/useExecuteOneServerlessFunction';
import { Button } from '@/ui/input/button/components/Button';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useUpdateOneServerlessFunction } from '@/settings/serverless-functions/hooks/useUpdateOneServerlessFunction';

export const TAB_LIST_COMPONENT_ID = 'serverless-function-detail';

const StyledH2Title = styled(H2Title)`
  margin-bottom: 0;
`;

export const SettingsServerlessFunctionDetail = () => {
  const { serverlessFunctionId = '' } = useParams();
  const { enqueueSnackBar } = useSnackBar();
  const navigate = useNavigate();
  const { activeTabIdState, setActiveTabId } = useTabList(
    TAB_LIST_COMPONENT_ID,
  );
  const activeTabId = useRecoilValue(activeTabIdState);
  const { serverlessFunction } =
    useGetOneServerlessFunction(serverlessFunctionId);
  const { executeOneServerlessFunction } = useExecuteOneServerlessFunction();
  const { updateOneServerlessFunction } = useUpdateOneServerlessFunction();
  const [savedCode, setSavedCode] = useState<string>('');
  const [formValues, setFormValues] = useServerlessFunctionFormValues();

  const handleSave = async () => {
    try {
      const result = await updateOneServerlessFunction({
        id: serverlessFunction.id,
        name: formValues.name || '',
        description: formValues.description || '',
        code: formValues.code || '',
      });
      setFormValues((prevState) => ({
        ...prevState,
        name: result?.data?.updateOneServerlessFunction?.name,
        description: result?.data?.updateOneServerlessFunction?.description,
        code: result?.data?.updateOneServerlessFunction?.code,
      }));
    } catch (err) {
      enqueueSnackBar(
        (err as Error)?.message || 'An error occurred while updating function',
        {
          variant: SnackBarVariant.Error,
        },
      );
    }
  };

  const handleExecute = async () => {
    if (!isDefined(formValues.input)) {
      setActiveTabId('test');
      return;
    }
    await handleSave();
    try {
      const result = await executeOneServerlessFunction(
        serverlessFunction.id,
        JSON.parse(formValues.input),
      );
      setFormValues((prevState) => ({
        ...prevState,
        output: JSON.stringify(
          result?.data?.executeOneServerlessFunction?.result,
          null,
          4,
        ),
      }));
    } catch (err) {
      enqueueSnackBar(
        (err as Error)?.message || 'An error occurred while executing function',
        {
          variant: SnackBarVariant.Error,
        },
      );
      setFormValues((prevState) => ({
        ...prevState,
        output: JSON.stringify(err, null, 4),
      }));
    }
    setActiveTabId('test');
  };

  useEffect(() => {
    const getFileContent = async () => {
      const resp = await fetch(
        getFileAbsoluteURI(serverlessFunction.sourceCodeFullPath),
      );
      if (resp.status !== 200) {
        throw new Error('Network response was not ok');
      } else {
        const result = await resp.text();
        setSavedCode(result);
        setFormValues((prevState) => ({
          ...prevState,
          code: result,
          name: serverlessFunction.name,
          description: serverlessFunction.description,
        }));
      }
    };
    if (isDefined(serverlessFunction?.sourceCodeFullPath)) {
      getFileContent();
    }
  }, [serverlessFunction, setFormValues]);

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
            setFormValues={setFormValues}
          />
        );
      case 'test':
        return (
          <SettingsServerlessFunctionTestTab
            formValues={formValues}
            setFormValues={setFormValues}
          />
        );
      case 'settings':
        return (
          <SettingsServerlessFunctionSettingsTab
            formValues={formValues}
            setFormValues={setFormValues}
          />
        );
      default:
        return <></>;
    }
  };

  const canSave =
    savedCode !== formValues.code ||
    serverlessFunction.name !== formValues.name ||
    serverlessFunction.description !== formValues.description;

  return (
    serverlessFunction.name && (
      <SubMenuTopBarContainer Icon={IconSettings} title="Settings">
        <SettingsPageContainer>
          <SettingsHeaderContainer>
            <Breadcrumb
              links={[
                { children: 'Functions', href: '/settings/functions' },
                { children: `${serverlessFunction.name}` },
              ]}
            />
            <SaveAndCancelButtons
              isSaveDisabled={!canSave}
              onCancel={() => {
                navigate('/settings/functions');
              }}
              onSave={handleSave}
            />
          </SettingsHeaderContainer>
          <Section>
            <StyledH2Title title={serverlessFunction.name} />
          </Section>
          <Section>
            <TabList tabListId={TAB_LIST_COMPONENT_ID} tabs={tabs} />
          </Section>
          <Section>
            <Button
              title="Run function"
              variant="primary"
              accent="blue"
              size="small"
              Icon={IconPlayerPlay}
              onClick={handleExecute}
            />
          </Section>
          {renderActiveTabContent()}
        </SettingsPageContainer>
      </SubMenuTopBarContainer>
    )
  );
};
