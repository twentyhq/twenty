import styled from '@emotion/styled';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { H2Title, IconCode, IconTrash } from 'twenty-ui';

import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useDeleteOneRecord } from '@/object-record/hooks/useDeleteOneRecord';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { SaveAndCancelButtons } from '@/settings/components/SaveAndCancelButtons/SaveAndCancelButtons';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { Webhook } from '@/settings/developers/types/webhook/Webhook';
import { getSettingsPagePath } from '@/settings/utils/getSettingsPagePath';
import { SettingsPath } from '@/types/SettingsPath';
import { Button } from '@/ui/input/button/components/Button';
import { Select } from '@/ui/input/components/Select';
import { TextArea } from '@/ui/input/components/TextArea';
import { TextInput } from '@/ui/input/components/TextInput';
import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
import { SubMenuTopBarContainer } from '@/ui/layout/page/SubMenuTopBarContainer';
import { Section } from '@/ui/layout/section/components/Section';
import { ResponsiveLine } from '@nivo/line';
const StyledFilterRow = styled.div`
  display: flex;
  flex-direction: row;
  gap: ${({ theme }) => theme.spacing(2)};
`;
const StyledGraphContainer = styled.div`
  height: 200px;
  width: 100%;
`;

type NivoLineInput = {
  id: string | number;
  color?: string;
  data: Array<{
    x: number | string | Date;
    y: number | string | Date;
  }>;
};
export const SettingsDevelopersWebhooksDetail = () => {
  const { objectMetadataItems } = useObjectMetadataItems();
  const navigate = useNavigate();
  const { webhookId = '' } = useParams();

  const [isDeleteWebhookModalOpen, setIsDeleteWebhookModalOpen] =
    useState(false);

  const [description, setDescription] = useState<string>('');
  const [operationObjectSingularName, setOperationObjectSingularName] =
    useState<string>('');
  const [operationAction, setOperationAction] = useState('');
  const [isDirty, setIsDirty] = useState<boolean>(false);
  const [data, setData] = useState<NivoLineInput[]>([]);

  const { record: webhookData } = useFindOneRecord({
    objectNameSingular: CoreObjectNameSingular.Webhook,
    objectRecordId: webhookId,
    onCompleted: (data) => {
      setDescription(data?.description ?? '');
      setOperationObjectSingularName(data?.operation.split('.')[0] ?? '');
      setOperationAction(data?.operation.split('.')[1] ?? '');
      setIsDirty(false);
    },
  });

  const { deleteOneRecord: deleteOneWebhook } = useDeleteOneRecord({
    objectNameSingular: CoreObjectNameSingular.Webhook,
  });

  const developerPath = getSettingsPagePath(SettingsPath.Developers);

  const deleteWebhook = () => {
    deleteOneWebhook(webhookId);
    navigate(developerPath);
  };

  const fieldTypeOptions = [
    { value: '*', label: 'All Objects' },
    ...objectMetadataItems.map((item) => ({
      value: item.nameSingular,
      label: item.labelSingular,
    })),
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const queryString = new URLSearchParams({
          webhookIdRequest: webhookId,
        }).toString();
        const token = ''; //put your tinybird token here
        const response = await fetch(
          `https://api.eu-central-1.aws.tinybird.co/v0/pipes/getWebhooksAnalytics.json?${queryString}`,
          {
            headers: {
              Authorization: 'Bearer ' + token,
            },
          },
        );
        const result = await response.json();
        const graphInput = result.data
          .flatMap(
            (dataRow: {
              start_interval: string;
              failure_count: number;
              success_count: number;
            }) => [
              {
                x: dataRow.start_interval,
                y: dataRow.failure_count,
                id: 'failure_count',
                color: 'red',
              },
              {
                x: dataRow.start_interval,
                y: dataRow.success_count,
                id: 'success_count',
                color: 'green',
              },
            ],
          )
          .reduce(
            (
              acc: NivoLineInput[],
              {
                id,
                x,
                y,
                color,
              }: { id: string; x: string; y: number; color: string },
            ) => {
              const existingGroupIndex = acc.findIndex(
                (group) => group.id === id,
              );
              const isExistingGroup = existingGroupIndex !== -1;

              if (isExistingGroup) {
                return acc.map((group, index) =>
                  index === existingGroupIndex
                    ? { ...group, data: [...group.data, { x, y }] }
                    : group,
                );
              } else {
                return [...acc, { id, color, data: [{ x, y }] }];
              }
            },
            [],
          );
        setData(graphInput);
      } catch (error) {
        /* empty todo add error to snackbar*/
      }
    };
    fetchData();
  }, [webhookId]);

  const { updateOneRecord } = useUpdateOneRecord<Webhook>({
    objectNameSingular: CoreObjectNameSingular.Webhook,
  });

  const handleSave = async () => {
    setIsDirty(false);
    await updateOneRecord({
      idToUpdate: webhookId,
      updateOneRecordInput: {
        operation: `${operationObjectSingularName}.${operationAction}`,
        description: description,
      },
    });
    navigate(developerPath);
  };

  if (!webhookData?.targetUrl) {
    return <></>;
  }
  //TO DO: Improve graphics axes, and cropped visualization
  return (
    <SubMenuTopBarContainer
      Icon={IconCode}
      title={webhookData.targetUrl}
      links={[
        {
          children: 'Workspace',
          href: getSettingsPagePath(SettingsPath.Workspace),
        },
        {
          children: 'Developers',
          href: developerPath,
        },
        { children: 'Webhook' },
      ]}
      actionButton={
        <SaveAndCancelButtons
          isSaveDisabled={!isDirty}
          onCancel={() => {
            navigate(developerPath);
          }}
          onSave={handleSave}
        />
      }
    >
      <SettingsPageContainer>
        <Section>
          <H2Title
            title="Endpoint URL"
            description="We will send POST requests to this endpoint for every new event"
          />
          <TextInput
            placeholder="URL"
            value={webhookData.targetUrl}
            disabled
            fullWidth
          />
        </Section>
        <Section>
          <H2Title title="Description" description="An optional description" />
          <TextArea
            placeholder="Write a description"
            minRows={4}
            value={description}
            onChange={(description) => {
              setDescription(description);
              setIsDirty(true);
            }}
          />
        </Section>
        <Section>
          <H2Title
            title="Filters"
            description="Select the event you wish to send to this endpoint"
          />
          <StyledFilterRow>
            <Select
              fullWidth
              dropdownId="object-webhook-type-select"
              value={operationObjectSingularName}
              onChange={(objectSingularName) => {
                setIsDirty(true);
                setOperationObjectSingularName(objectSingularName);
              }}
              options={fieldTypeOptions}
            />
            <Select
              fullWidth
              dropdownId="operation-webhook-type-select"
              value={operationAction}
              onChange={(operationAction) => {
                setIsDirty(true);
                setOperationAction(operationAction);
              }}
              options={[
                { value: '*', label: 'All Actions' },
                { value: 'create', label: 'Create' },
                { value: 'update', label: 'Update' },
                { value: 'delete', label: 'Delete' },
              ]}
            />
          </StyledFilterRow>
        </Section>
        {data.length ? (
          <Section>
            <H2Title title="Statistics" />

            <StyledGraphContainer>
              <ResponsiveLine
                data={data}
                colors={(d) => d.color}
                margin={{ top: 0, right: 0, bottom: 50, left: 60 }}
                xFormat="time:%Y-%m-%d %H:%M%"
                xScale={{
                  type: 'time',
                  useUTC: false,
                  format: '%Y-%m-%d %H:%M:%S',
                  precision: 'hour',
                }}
                yScale={{
                  type: 'linear',
                }}
                axisBottom={{
                  tickValues: 'every day',
                  format: '%b %d',
                }}
                enableTouchCrosshair={true}
                enableGridY={false}
                enableGridX={false}
                enablePoints={false}
              />
            </StyledGraphContainer>
          </Section>
        ) : (
          <></>
        )}
        <Section>
          <H2Title title="Danger zone" description="Delete this integration" />
          <Button
            accent="danger"
            variant="secondary"
            title="Delete"
            Icon={IconTrash}
            onClick={() => setIsDeleteWebhookModalOpen(true)}
          />
          <ConfirmationModal
            confirmationPlaceholder="yes"
            confirmationValue="yes"
            isOpen={isDeleteWebhookModalOpen}
            setIsOpen={setIsDeleteWebhookModalOpen}
            title="Delete webhook"
            subtitle={
              <>Please type "yes" to confirm you want to delete this webhook.</>
            }
            onConfirmClick={deleteWebhook}
            deleteButtonText="Delete webhook"
          />
        </Section>
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
